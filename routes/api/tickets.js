var router = require('express').Router();
var mongoose = require('mongoose');
var Ticket = mongoose.model('Ticket');
var Client = mongoose.model('Client');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');
var auth = require('../auth');

// Preload article objects on routes with ':article'
router.param('article', function(req, res, next, slug) {
  Ticket.findOne({ slug: slug})
    .populate('author')
    .then(function (article) {
      if (!article) { return res.sendStatus(404); }

      req.article = article;

      return next();
    }).catch(next);
});

router.param('comment', function(req, res, next, id) {
  Comment.findById(id).then(function(comment){
    if(!comment) { return res.sendStatus(404); }

    req.comment = comment;

    return next();
  }).catch(next);
});

router.get('/', auth.optional, function(req, res, next) {
  var query = {};
  var limit = 20;
  var offset = 0;

  query.archived = false;

  if(typeof req.query.limit !== 'undefined'){
    limit = req.query.limit;
  }

  if(typeof req.query.offset !== 'undefined'){
    offset = req.query.offset;
  }

  if( typeof req.query.tag !== 'undefined' ){
    query.tagList = {"$in" : [req.query.tag]};
  }

  Promise.all([
    req.query.author ? User.findOne({username: req.query.author}) : null,
    req.query.favorited ? User.findOne({username: req.query.favorited}) : null
  ]).then(function(results){
    var author = results[0];
    var favoriter = results[1];

    if(author){
      query.author = author._id;
    }

    if(favoriter){
      query._id = {$in: favoriter.favorites};
    } else if(req.query.favorited){
      query._id = {$in: []};
    }
    console.log('queeeeeeeeeeeeeeeeeeeeery', query)
    return Promise.all([
      Ticket.find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .sort({createdAt: 'desc'})
        .populate('author')
        .populate('technician')
        .populate('client')
        .exec(),
        Ticket.count(query).exec(),
      req.payload ? User.findById(req.payload.id) : null,
    ]).then(function(results){
      var articles = results[0];
      var articlesCount = results[1];
      var user = results[2];

      return res.json({
        articles: articles.map(function(article){
          return article.toJSONFor(user);
        }),
        articlesCount: articlesCount
      });
    });
  }).catch(next);
});

router.get('/feed', auth.required, function(req, res, next) {
  var limit = 20;
  var offset = 0;

  if(typeof req.query.limit !== 'undefined'){
    limit = req.query.limit;
  }

  if(typeof req.query.offset !== 'undefined'){
    offset = req.query.offset;
  }

  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    Promise.all([
      Ticket.find({ author: {$in: user.following}, archived: false})
        .limit(Number(limit))
        .skip(Number(offset))
        .populate('author')
        .populate('technician')
        .populate('client')
        .exec(),
        Ticket.count({ author: {$in: user.following}})
    ]).then(function(results){
      var articles = results[0];
      var articlesCount = results[1];

      return res.json({
        articles: articles.map(function(article){
          return article.toJSONFor(user);
        }),
        articlesCount: articlesCount
      });
    }).catch(next);
  });
});

// Get all

router.get('/all', auth.required, function(req, res, next) {
  var limit = 20;
  var offset = 0;

  if(typeof req.query.limit !== 'undefined'){
    limit = req.query.limit;
  }

  if(typeof req.query.offset !== 'undefined'){
    offset = req.query.offset;
  }
  User.findById(req.payload.id).then(function(user){
  Promise.all([
    Ticket.find({archived: false})
      .limit(Number(limit))
      .skip(Number(offset))
      .populate('author')
      .populate('technician')
      .populate('client')
      .exec(),
      Ticket.count()
  ]).then(function(results){
    var articles = results[0];
    var articlesCount = results[1];

    return res.json({
      articles: articles.map(function(article){
        return article.toJSONFor(user);
      }),
      articlesCount: articlesCount
    });
  }).catch(next);
});
  // Ticket.find().then(function(ticket){
  //   if (!ticket) { return res.sendStatus(401); }
  //   return res.json({
  //     tickets: ticket.map(function(tick){
  //       return tick;
  //     }),
  //   });
  // });
});


// new ticket 
router.post('/', auth.required, function(req, res, next) {

  var article = new Ticket(req.body.article);
  var client = new Client();
  Client.findOne({name: req.body.article.client.name}).then(function(result) {
    if (!result) {
      client = req.body.article.client;
      client.save().then(function(client) {
        return article.client = client;
      })
    } else {
      article.client = result;  
    }
  })

  Promise.all([ 
    User.findById(req.payload.id),
    User.findOne({username: req.body.article.technician.username})
    ]).then(function(result) {
      
      article.author = result[0];
      article.technician = result[1];
      article.modifiedBy = result[0];

      return article.save().then(function(){
        return res.json({article: article.toJSONFor(result[0])});
      })
  }).catch(next);
});

// return a article
router.get('/:article', auth.optional, function(req, res, next) {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.article.populate('author')
    .populate('technician')
    .populate('client').execPopulate()
  ]).then(function(results){
    var user = results[0];

    return res.json({article: req.article.toJSONFor(user)});
  }).catch(next);
});

// update article
router.put('/:article', auth.required, function(req, res, next) {
  Ticket.findOne({slug: req.params.article}).then(function(ticket) {
    Promise.all([ 
      User.findById(req.payload.id),
      User.findById(req.body.article.technician.id),
      Client.findById(req.body.article.client._id)
      ]).then(function(result) {
        
        if(typeof req.body.article.title !== 'undefined'){
          ticket.title = req.body.article.title;
        }

        if(typeof req.body.article.status !== 'undefined'){
          ticket.status = req.body.article.status;
        }

        if(typeof req.body.article.body !== 'undefined'){
          ticket.body = req.body.article.body;
        }

        if(typeof req.body.article.tagList !== 'undefined'){
          ticket.tagList = req.body.article.tagList
        }
        if(typeof req.body.article.client === 'object'){
          ticket.client = result[2];
        }
        if(typeof req.body.article.technician === 'object'){
          ticket.technician = result[1];
        }
        ticket.modifiedBy = result[0];

        return ticket.save().then(function(){
          return res.json({article: ticket});
        })
    }).catch(next);
  });

});

// get all archived tickets
router.get('/archived/all', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
      Ticket.find({archived: true})
      .populate('client').
      populate('technician').
      exec().then(function(articles) {
        return res.json({
          articles: articles
        });
      })
  });
});


// archive article
router.get('/archive/:article', auth.required, function(req, res, next) {
  Ticket.findOne({slug: req.params.article}).then(function(ticket) {
    ticket.archived = true;
    ticket.save().then(function(ticket){
      return res.json({ticket: ticket});
    });
  })
});

// UNarchive article
router.get('/unarchive/:article', auth.required, function(req, res, next) {
  Ticket.findOne({slug: req.params.article}).then(function(ticket) {
    ticket.archived = false;
    ticket.save().then(function(ticket){
      return res.json({ticket: ticket});
    });
  })
});

// delete article
router.delete('/:article', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    if(req.article.author._id.toString() === req.payload.id.toString()){
      return req.article.remove().then(function(){
        return res.sendStatus(204);
      });
    } else {
      return res.sendStatus(403);
    }
  }).catch(next);
});

// delete article
router.delete('/:article', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    if(req.article.author._id.toString() === req.payload.id.toString()){
      return req.article.remove().then(function(){
        return res.sendStatus(204);
      });
    } else {
      return res.sendStatus(403);
    }
  }).catch(next);
});

// Favorite an article
router.post('/:article/favorite', auth.required, function(req, res, next) {
  var articleId = req.article._id;

  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    return user.favorite(articleId).then(function(){
      return req.article.updateFavoriteCount().then(function(article){
        return res.json({article: article.toJSONFor(user)});
      });
    });
  }).catch(next);
});

// Unfavorite an article
router.delete('/:article/favorite', auth.required, function(req, res, next) {
  var articleId = req.article._id;

  User.findById(req.payload.id).then(function (user){
    if (!user) { return res.sendStatus(401); }

    return user.unfavorite(articleId).then(function(){
      return req.article.updateFavoriteCount().then(function(article){
        return res.json({article: article.toJSONFor(user)});
      });
    });
  }).catch(next);
});

// return an article's comments
router.get('/:article/comments', auth.optional, function(req, res, next){
  Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function(user){
    return req.article.populate({
      path: 'comments',
      populate: {
        path: 'author'
      },
      options: {
        sort: {
          createdAt: 'desc'
        }
      }
    }).execPopulate().then(function(article) {
      return res.json({comments: req.article.comments.map(function(comment){
        return comment.toJSONFor(user);
      })});
    });
  }).catch(next);
});

// create a new comment
router.post('/:article/comments', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }
    var comment = new Comment(req.body.comment);
    comment.article = req.article;
    comment.author = user;
    // req.body.comment.file.forEach((filename) => {
    //   let file = 'http://localhost:3000/api/public/uploads/' + filename;
    //   comment.file.concat('eeeeeeeeeeeeee')
    // });
    return comment.save().then(function(){
      req.article.comments = req.article.comments.concat([comment]);

      return req.article.save().then(function(article) {
        res.json({comment: comment.toJSONFor(user)});
      });
    });
  }).catch(next);
});

router.delete('/:article/comments/:comment', auth.required, function(req, res, next) {
  if(req.comment.author.toString() === req.payload.id.toString()){
    req.article.comments.remove(req.comment._id);
    req.article.save()
      .then(Comment.find({_id: req.comment._id}).remove().exec())
      .then(function(){
        res.sendStatus(204);
      });
  } else {
    res.sendStatus(403);
  }
});

// get report from one date
router.post('/report/daily', auth.required, function(req, res, next) {
  console.log('eeeeeeeeeeeeeeee', req.body.date)
  var theDate = new Date(req.body.date);

//   Ticket.aggregate(
//     [ {
//       $match: { createdAt : { $gt: theDate } }
//     },
//     {
//       $sort: { createdAt: 1 }
//     }
//  ]
//  )
Ticket.aggregate([
  {
    $project:
      {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
        hour: { $hour: "$createdAt" },
        minutes: { $minute: "$createdAt" },
        seconds: { $second: "$createdAt" },
        milliseconds: { $millisecond: "$createdAt" },
        dayOfYear: { $dayOfYear: "$createdAt" },
        dayOfWeek: { $dayOfWeek: "$createdAt" },
        week: { $week: "$createdAt" },
        slug : 1,
        title : 1,
        author : 1,
        technician : 1,
        client : 1,
      }
  }, {
    $match: {year: theDate.getFullYear(), month: theDate.getMonth() + 1, day: theDate.getDate()}
  },
  {
    $lookup: {
        from: "clients",
        localField: "client",
        foreignField: "_id",
        as: "client"
    }
},
{
  $lookup: {
      from: "users",
      localField: "technician",
      foreignField: "_id",
      as: "technician"
  }
},
{
  $lookup: {
      from: "users",
      localField: "author",
      foreignField: "_id",
      as: "author"
  }
}])
 .then(function(ticket){
    console.log(ticket)
    return res.json({article: ticket});
  });
});


module.exports = router;
