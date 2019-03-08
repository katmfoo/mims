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
        products.c.units_per_case
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

# Function to get previous inventory movement of a product from a specific starting date
def targetGetProductMovement(itemCode, startDateTime):
    movement = {}

    startDateTime = startDateTime.replace(hour=23,minute=59,second=59)

    # For each day from startDate to today
    while startDateTime <= datetime.datetime.today().replace(hour=23,minute=59,second=59):
        # Get inventory at current date we are iterating on    
        movement[str(startDateTime.date())] = targetGetProductInventory(itemCode, str(startDateTime))

        # Increment date by 1 day
        startDateTime = startDateTime + datetime.timedelta(days=1)
    
    return movement

# Function to get forecasted inventory transactions of a product
def targetGetProductForecast(itemCode):
    return {}