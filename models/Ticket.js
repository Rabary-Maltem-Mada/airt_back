var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug');
var User = mongoose.model('User');


var TicketSchema = new mongoose.Schema({
  slug: {type: String, lowercase: true, unique: true},
  technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  title: String,
  source: String,
  cause: String,
  status: String,
  body: String,
  favoritesCount: {type: Number, default: 0},
  archived: Boolean,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  tagList: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {timestamps: true});

// TicketSchema.plugin(uniqueValidator, {message: 'is already taken'});

TicketSchema.pre('validate', function(next){
  if(!this.slug)  {
    var ticket = mongoose.model('Ticket');
    return ticket.count().then(count => {
      const inc = 1;
      const ref = Number(count) + Number(inc);
      if(count < 10) {
        this.slug = 'REF-0000' + ref;
      } else if (count < 100){
        this.slug = 'REF-000' + ref;
      } else if (count < 1000) {
        this.slug = 'REF-00' + ref;
      } else if (count < 10000){
        this.slug = 'REF-0' + ref;
      } else if (count < 100000){
        this.slug = 'REF-' + ref;
      }
      
      this.archived = false;
    })

  }
  next();
});


TicketSchema.methods.slugify = function() {
  this.slug = slug('REF') + '-' + makeRef().toString(36);
};

TicketSchema.methods.updateFavoriteCount = function() {
  var article = this;

  return User.count({favorites: {$in: [article._id]}}).then(function(count){
    article.favoritesCount = count;

    return article.save();
  });
};

TicketSchema.methods.toJSONFor = function(user){
  return {
    slug: this.slug,
    title: this.title,
    status: this.status,
    body: this.body,
    source: this.source,
    cause: this.cause,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    modifiedBy: this.modifiedBy,
    tagList: this.tagList,
    favorited: user ? user.isFavorite(this._id) : false,
    favoritesCount: this.favoritesCount,
    author: this.author.toProfileJSONFor(user),
    technician: this.technician,
    client: this.client
  };
};

mongoose.model('Ticket', TicketSchema);
