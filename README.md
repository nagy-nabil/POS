# POS
point of sale with nodejs

# tech
- typescript
- nodejs
- expressjs
- formidable
- mongoose

***install Dependencies***
```
npm install
```
***watch typescript changes***
```
npm run dev
```
***Run  js [from dist]***
```
npm run start
```
***Run ts [from src without converting to js]***
```
npm run ts
```
***Run Tests***
```
npm run test
```
# features 
- sign in 
- register
- get me[user] just send the tokken and the server return the user
- update user
- reset password
- email validation
- machine CRUD
- supplier CRUD
- branch CRUD
- remove bulk from branch
- inline edit for any model [but for now it's only connected to the branch api end point]
- products crud
- order crud
- relation between order and products [decrease product stock based on each order itm]

# End Points 🧭
> by default all content type is application/json 
- **/register**
    - POST
    - required feilds [body]
        - username [ must be uniqe]
        - password
        - email
    - send validation email to the email provided before if success{
        result:"error" | "Success",
        message:"--------"
    }
- **/activation/TOKEN**
    - GET
    - handle the validation from the email and redirct the user to the front end [/success || /error]
- **/login**
    - GET
    - required feilds [body]
        - username 
        - password
    - send back token to the user[use the token alover the site to gain access to our features]
    - {
        result:"error" | "Success",
        message:"--------",
        token:"TOKEN"
    }
- **/api/user/me**
    - GET
    - required feilds [headers]
        - authorization [Bearer **TOKEN**]
    - return all user data could be used to fill update user data form
- **/api/user/me**
    - PUT
    - multipart/form-data
    - no required feilds [form fields] update what we got
    - {
        result:"error" | "Success",
        message:"--------"
    }
- **/password/reset**
    - POST
    - required feilds [body]
        - username 
    - send reset link to the user email , and the link in the email redirect the user to the front end and the front end suppose to redirect the new password to the api through [password/reset?token=**TOKEN**]{
        result:"error" | "warning",
        message:"--------"
    }
- **/password/reset?token=TOKEN**
    - PUT
    - required feilds [body]
        - password
    - update user password
    - {
        result:"error" | "Success",
        message:"--------"
    }
> from now on all end points MUST get authorization in the headres
- **/api/product**
    - POST
    - multipart/form-data
    - required feilds [fields]
        - name [ must be uniqe]
        - stock
        - price
    - create new product
    - {
        result:"error" | "Success",
        message:"--------",
        data:**PRODUCT**
    }
- **/api/product**
    - GET
    - return all products in the database
    - {
        result:"error" | "Success",
        message:"--------",
        data:**PRODUCT**[]
    }
- **/api/product/:id**
    - GET
    - return one product data by its id
    - {
        result:"error" | "Success",
        message:"--------",
        data:**PRODUCT**
    }
- **/api/product/:id**
    - PUT
    - multipart/form-data
    - required feilds [from fields]
        - name [ must be uniqe , or the same name you just have to submit all data back]
        - stock
        - price
    - update Product
    - {
        result:"error" | "Success",
        message:"--------"
    }
- **/api/product/:id**
    - DELETE
    - delete one Product data from the database
    - {
        result:"error" | "Success",
        message:"--------"
    }
> from now on all end points MUST get authorization in the headres
- **/api/machine**
    - POST
    - required feilds [body]
        - serial_number [ must be uniqe]
        - alias
    - create new POS Machine
    - {
        result:"error" | "Success",
        message:"--------",
        data:**machine**
    }
- **/api/machine**
    - GET
    - return all machines in the database
    - {
        result:"error" | "Success",
        message:"--------",
        data:**machine**[]
    }
- **/api/machine/:id**
    - GET
    - return one machine data by its id
    - {
        result:"error" | "Success",
        message:"--------",
        data:**machine**
    }
- **/api/machine/:id**
    - PUT
    - update machine
    - {
        result:"error" | "Success",
        message:"--------",
        data:***machine**
    }
- **/api/machine/:id**
    - DELETE
    - delete one machine data from the database
    - {
        result:"error" | "Success",
        message:"--------"
    }
> from now on all end points MUST get authorization in the headres
- **/api/branch**
    - POST
    - multipart/form-data
    - required feilds [fields]
        - name [ must be uniqe]
        - tel
    - create new branch
    - {
        result:"error" | "Success",
        message:"--------",
        data:**branch**
    }
- **/api/branch**
    - GET
    - return all branchs in the database
    - {
        result:"error" | "Success",
        message:"--------",
        data:**branch**[]
    }
- **/api/branch/:id**
    - GET
    - return one branch data by its id
    - {
        result:"error" | "Success",
        message:"--------",
        data:**branch**
    }
- **/api/branch/:id**
    - PUT
    - multipart/form-data
    - required feilds [from fields]
        - name [ must be uniqe , or the same name you just have to submit all data back]
        - tel
    - update branch
    - {
        result:"error" | "Success",
        message:"--------"
    }
- **/api/branch/:id**
    - DELETE
    - delete one branch data from the database
    - {
        result:"error" | "Success",
        message:"--------"
    }
> from now on all end points MUST get authorization in the headres
- **/api/order**
    - POST
    - required feilds [body]
        - total
        - paid
        - change
        - order_list [JSON.stringify([{id:PRODUCT ID , qty: SELLED AMOUNT}])]
        - payment_type
        - payment_detail
    - create new order
    - {
        result:"error" | "Success",
        message:"--------",
        data:**order**
    }
- **/api/order**
    - GET
    - return all orders in the database
    - {
        result:"error" | "Success",
        message:"--------",
        data:**order**[]
    }
- **/api/order/:id**
    - GET
    - return one order data by its id
    - {
        result:"error" | "Success",
        message:"--------",
        data:**order**
    }
- **/api/order/:id**
    - PUT
    - update order
    - {
        result:"error" | "Success",
        message:"--------"
    }
- **/api/order/:id**
    - DELETE
    - delete one order data from the database
    - {
        result:"error" | "Success",
        message:"--------"
    }
# todo
- [ ] hash password
- [ ] vaild email
- [ ] solve sent email as spam
- [ ] remove [/login/error , /login/success]
- [ ] type gurd for order_list 
- [ ] documentation HAHAHAHAHAAAHHA

***.env must contain :***
```
SENDGRID_API_KEY=
PORT= 
MONGO_USER = 
MONGO_PASSWORD =
SECRET = 
EXPIRESIN = 
ACTIVESECRET = 
ACTIVEESPIRES = 
RESETSECRET = 
RESETESPIRES =
```