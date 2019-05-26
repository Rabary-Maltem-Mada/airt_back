var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({ 
  categorie : {type: String},
  message: String,
}, {timestamps: true});

// Requires population of author
EventSchema.methods.toJSONFor = function(user){
  return {
    id: this._id,
    categorie: this.body,
    message: this.email,
  };
};

mongoose.model('Event', EventSchema);
