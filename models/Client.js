var mongoose = require('mongoose');

var ClientSchema = new mongoose.Schema({
  name: String,
  image: String,
}, {timestamps: true});

// Requires population of author
ClientSchema.methods.toJSONFor = function(user){
  return {
    id: this._id,
    name: this.body,
    image: this.image || 'http://localhost/madadev/client.jpg',
    createdAt: this.createdAt,
  };
};

mongoose.model('Client', ClientSchema);
