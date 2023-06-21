alter table "Product" add constraint "stock_less_zero" check (stock >= 0);

alter table "Product" add constraint "buyprice_less_zero" check ("buyPrice" > 0);

alter table "Product" add constraint "sellprice_less_zero" check ("sellPrice" > 0);

alter table "ProductsOnOrder" add constraint "quntatity_zero" check (quantity > 0);