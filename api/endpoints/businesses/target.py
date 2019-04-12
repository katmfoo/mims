from sqlalchemy import Table, MetaData
from sqlalchemy.sql import select, or_, join, alias, func
import datetime
from utility import targetDbEng, resultSetToJson, setPagination

# Function for GET /products/
def targetGetProducts(data):

    # Setup database connection, table, and query
    con = targetDbEng.connect()
    products = Table('products', MetaData(targetDbEng), autoload=True)
    plus = Table('plus', MetaData(targetDbEng), autoload=True)
    stm = select([
        products.c.item_code,
        products.c.name,
        products.c.price,
        plus.c.name.label('plu'),
        products.c.plu.label('plu_number'),
        products.c.image_url
    ]).select_from(products.join(plus, products.c.plu == plus.c.plu))

    # Handle optional filters
    if 'name' in data:
        stm = stm.where(products.c.name.like('%' + data['name'] + '%'))
    if 'item_code' in data:
        stm = stm.where(products.c.item_code == data['item_code'])
    if 'plu' in data:
        stm = stm.where(products.c.plu == data['plu'])
    if 'barcode' in data:
        stm = stm.where(products.c.barcode == data['barcode'])
    if 'department' in data:
        stm = stm.where(products.c.department == data['department'])
    
     # Handle search_term
    if 'search_term' in data:
        search_term = '%' + data['search_term'] + '%'
        stm = stm.where(or_(
            products.c.name.like(search_term),
            products.c.item_code.like(search_term),
            products.c.plu.like(search_term)
        ))
    
    # Handle page_size and page
    stm = setPagination(stm, data)

    # Get items
    items = resultSetToJson(con.execute(stm).fetchall())
    con.close()

    for item in items:
        item['price'] = float(item['price'])

    return items

# Function for GET /products/{item_code}/
def targetGetProduct(itemCode):

    # Setup database connection, table, and query
    con = targetDbEng.connect()
    products = Table('products', MetaData(targetDbEng), autoload=True)
    departments = Table('departments', MetaData(targetDbEng), autoload=True)
    units = Table('units', MetaData(targetDbEng), autoload=True)
    plus = Table('plus', MetaData(targetDbEng), autoload=True)

    stm = select([
        products.c.item_code,
        products.c.name,
        products.c.price,
        departments.c.name.label('department'),
        products.c.department.label('department_number'),
        plus.c.name.label('plu'),
        products.c.plu.label('plu_number'),
        products.c.barcode,
        units.c.name.label('unit'),
        products.c.units_per_case,
        products.c.image_url
    ]).select_from(products
        .join(departments, products.c.department == departments.c.id)
        .join(units, products.c.unit == units.c.id)
        .join(plus, products.c.plu == plus.c.plu)
    ).where(products.c.item_code == itemCode)

    items = resultSetToJson(con.execute(stm).fetchall())
    con.close()

    if items:
        item = items[0]
        item['units_per_case'] = int(item['units_per_case'])
        item['price'] = float(item['price'])
        if item['barcode'] == "None":
            item['barcode'] = None
        item['current_inventory'] = targetGetProductInventory(itemCode)
    else:
        item = None

    return item

def targetEditProduct(itemCode, data):
    
    # Setup database connection and table
    con = targetDbEng.connect()
    products = Table('products', MetaData(targetDbEng), autoload=True)

    # Main update statement
    stm = products.update().where(products.c.item_code == itemCode)

    # Check potential passed in params to update
    if 'price' in data:
        stm = stm.values(price=data['price'])
    
    con.execute(stm)
    con.close()

    return itemCode

# Function to get a unit
def targetGetUnit(unit):

    # Setup database connection, table, and query
    con = targetDbEng.connect()
    units = Table('units', MetaData(targetDbEng), autoload=True)

    stm = select([units]).where(units.c.id == unit)

    items = resultSetToJson(con.execute(stm).fetchall())
    con.close()

    if items:
        item = items[0]
    else:
        item = None

    return item

# Function to get inventory of a product, optionally at a specific point in time
def targetGetProductInventory(itemCode, datetime=None):

    # Setup database connection, table, and query
    con = targetDbEng.connect()
    products = Table('products', MetaData(targetDbEng), autoload=True)
    inventory_transactions = Table('inventory_transactions', MetaData(targetDbEng), autoload=True)

    stm = select([
        func.coalesce(
            func.sum(
                func.IF(
                    inventory_transactions.c.unit == 3,
                    inventory_transactions.c.amount * products.c.units_per_case,
                    inventory_transactions.c.amount
                )
            ),
            0
        )
    ]).select_from(
        inventory_transactions.join(
            products,
            inventory_transactions.c.item_code == products.c.item_code
    )).where(inventory_transactions.c.item_code == itemCode)

    if datetime:
        stm = stm.where(inventory_transactions.c.creation_datetime <= datetime)

    current_inventory = con.execute(stm).fetchone()
    con.close()

    return int(current_inventory[0])

# Function to return number of sales of a product from a certain date
def targetGetProductSales(itemCode, date):

    # Setup database connection, table, and query
    con = targetDbEng.connect()
    sale_items = Table('sale_items', MetaData(targetDbEng), autoload=True)
    inventory_transactions = Table('inventory_transactions', MetaData(targetDbEng), autoload=True)

    stm = select([
        func.coalesce(
            func.sum(inventory_transactions.c.amount),
            0
        )
    ]).select_from(
        sale_items.join(
            inventory_transactions,
            sale_items.c.inventory_transaction == inventory_transactions.c.id
    )).where(inventory_transactions.c.item_code == itemCode).where(inventory_transactions.c.creation_datetime.like(date + '%'))

    num_sales = con.execute(stm).fetchone()
    con.close()

    return -int(num_sales[0])

# Function to get previous inventory movement of a product from a specific starting date
def targetGetProductMovement(itemCode, startDate):
    movement = {}

    # For each day from startDate to today
    while startDate <= datetime.datetime.today().date():
        # Get num sales at current date we are iterating on
        movement[str(startDate)] = targetGetProductSales(itemCode, str(startDate))

        # Increment date by 1 day
        startDate = startDate + datetime.timedelta(days=1)
    
    return movement

# Function to get forecasted inventory transactions of a product
def targetGetProductForecast(itemCode):
    # Empty dictionary used to store forecast in format "'future_day': forecast_value"
    forecast = {}

    # Calculated weights for using exponential weighting forumula for projection
    partial_weight = [12, 7, 4, 3, 2, 2, 1, 1]
    full_weight = 32

    # Measurement definitions so I can write stuff like English, will change later to formal calls for memory reasons
    current_day = datetime.datetime.today().date()
    one_day = datetime.timedelta(days=1)
    one_week = datetime.timedelta(weeks=1)

    i = 0
    # i < 8 so we can get a full week of data (I know I can just do a while statement using time delta)
    while i < 8:
        j = 1
        forecast_value = 0
        # j < 9 to get 8 past weeks of data
        while j < 9:
            # Get this day, but last week
            past_date = current_day - (one_week*j)
            # Get sale information on this product on that day
            previous_sales = targetGetProductSales(itemCode, str(past_date))
            # Forecast = Forecast + sale information from that day weighted
            forecast_value += previous_sales * (partial_weight[j-1] / full_weight)
            # Increment
            j += 1
        # Future_day : forecast_value
        forecast[str(current_day)] = int(forecast_value)
        # Get next day
        current_day += one_day
        # Increment
        i += 1

    return forecast

# Function to create an inventory transaction
def targetCreateInventoryTransaction(data):

    # Setup database connection and table
    con = targetDbEng.connect()
    inventory_transactions = Table('inventory_transactions', MetaData(targetDbEng), autoload=True)

    # Create inventory transactions
    stm = inventory_transactions.insert().values(item_code=data['item_code'], amount=data['amount'], unit=data['unit'], creation_datetime=data['datetime'])
    result = con.execute(stm)
    con.close()

    return result.lastrowid

# Function to create a sale
def targetCreateSale(data):

    # Setup database connection and table
    con = targetDbEng.connect()
    sales = Table('sales', MetaData(targetDbEng), autoload=True)
    products = Table('products', MetaData(targetDbEng), autoload=True)
    sale_items = Table('sale_items', MetaData(targetDbEng), autoload=True)

    # Create sale
    stm = sales.insert()
    sale = con.execute(stm)

    sale_id = sale.lastrowid

    # Create inventory transactions and sale items
    for item in data['items']:
        # Get the item to figure out what unit it is sold in and what its price is
        stm = select([products]).where(products.c.item_code == item['item_code'])
        item_obj = con.execute(stm).fetchone()
        item['unit'] = item_obj['unit']
        
        sale_item_price = float(item['amount']) * float(item_obj['price'])
        
        item['amount'] = -float(item['amount'])

        # Create the inventory transaction
        inventory_transaction_id = targetCreateInventoryTransaction(item)

        # Create the sale item
        stm = sale_items.insert().values(sale=sale_id, inventory_transaction=inventory_transaction_id, price=sale_item_price)
        result = con.execute(stm)

    con.close()

    return sale_id
