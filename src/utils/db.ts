import mongoose from "mongoose";
export function connect(){
  if(typeof process.env.DBURL === "string" )
    mongoose.connect(process.env.DBURL) 
    else throw new Error("db url must be provided [env error]")

    mongoose.connection.on('connected', function () {  
      console.log('Mongoose default connection open');
    }); 
    
    mongoose.connection.on('error',function (err) {  
      console.log('Mongoose default connection error: ' + err);
    }); 
    
    mongoose.connection.on('disconnected', function () {  
      console.log('Mongoose default connection disconnected'); 
    });
    
    process.on('SIGINT', function() {  
      mongoose.connection.close(function () { 
        console.log('Mongoose default connection disconnected through app termination'); 
        process.exit(0); 
      }); 
    });
}
