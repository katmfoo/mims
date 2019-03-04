from sqlalchemy import Table, MetaData
from sqlalchemy.sql import select, or_
from utility import shopriteDbEng, resultSetToJson, setPagination

# Function for GET /products/
def shopRiteGetProducts(data):

    # Setup database connection, table, and query
    con = shopriteDbEng.connect()
    products = Table('products', MetaData(shopriteDbEng), autoload=True)
    stm = select([products])

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
    items = resultSetToJson(con.execute(stm).fetchall(), ['department', 'barcode', 'unit', 'units_per_case', 'updated_datetime', 'creation_datetime'])

    con.close()

    return {
        'items': items
    }

# Function for GET /products/<item_code>/
def shopRiteGetProduct(itemCode):

    # Setup database connection, table, and query
    con = shopriteDbEng.connect()
    products = Table('products', MetaData(shopriteDbEng), autoload=True)
    stm = select([products]).where(products.c.item_code == itemCode)

    items = resultSetToJson(con.execute(stm).fetchall(), ['updated_datetime', 'creation_datetime'])

    con.close()

    return {
        'items': items
    }