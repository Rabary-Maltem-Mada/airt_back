var mongoose = require('mongoose');

var ClientSchema = new mongoose.Schema({
  name: {type: String, required: [true, "can't be blank"]},
  email : {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  image: String,
}, {timestamps: true});

// Requires population of author
ClientSchema.methods.toJSONFor = function(user){
  return {
    id: this._id,
    name: this.body,
    email: this.email,
    image: this.image || 'http://localhost/madadev/client.jpg',
    createdAt: this.createdAt,
  };
};

mongoose.model('Client', ClientSchema);
