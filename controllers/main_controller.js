var express = require("express");
var router = express.Router();
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");

// Requiring our Note and Article models
var Note = require("../models/Note.js");
var Article = require("../models/Article.js");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


router.get("/", function(req, res) {
    Article.find({}, function(error, doc) {
      if (error) {
        res.send(error);
      } else {
        console.log(doc);
        var scrapedNews = { news: doc };
        // var doc_1h = doc.splice(0, doc.length / 2);
        // // doc is now second half of the array
        // var scrapedNews = { news_1h: doc_1h, news_2h: doc };
        res.render("index", scrapedNews);
      }
    });

})

// A GET request to scrape BBC's website
router.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://www.bbc.com/news", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

    var articleCount = 0;
    $("h3.gs-c-promo-heading__title").each(function(i, element) {
      if ($(this).parent().attr("href")) articleCount ++;
    });
    // Now, we grab every h3 with the class "gs-c-promo-heading__title", and do the following:
    $("h3.gs-c-promo-heading__title").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).text();
      console.log("title", result.title);
      var scrapedURL = $(this).parent().attr("href");
      console.log("url", scrapedURL);
      var completeURL = "";
      if (scrapedURL) {      
        if (scrapedURL.indexOf("www.bbc") < 0) {
          completeURL = "https://www.bbc.com" + scrapedURL;
        } else {
          completeURL = scrapedURL;
        }
        result.link = completeURL;

        // Using our Article model, create a new entry
        // This effectively passes the result object to the entry (and the title and link)
        var entry = new Article(result);

        // Now, save that entry to the db
        entry.save(function(err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          }
          // Or log the doc
          else {
            console.log(doc);
          }
        });
      }
      if (i === articleCount - 1) res.redirect("/");
    });
  });
  // Tell the browser that we finished scraping the text
  
});


router.get("/articles", function(req, res) {
  Article.find({}, function(error, doc) {
    if (error) {
      res.send(error);
    } else {
      res.send(doc);
    }
  });
});


router.get("/articles/:id", function(req, res) {
  Article.find({ _id: req.params.id }).populate("note").exec(function(error, doc) {
    if (error) {
      res.send(error);
    } else {
      var articleObj = doc[0]
      res.render("article", articleObj);
    }
  });
})



router.post("/articles/:id", function(req, res) {
  var newNote = new Note(req.body);
  newNote.save(function(error, doc) {
    if (error) {
      res.send(error);
    } else {
      Article.findOneAndUpdate({ _id: req.params.id}, {$push: { "note": doc._id}}, { new: true }, function(err, newDoc) {
        if (error) {
          res.send(error);
        } else {
          console.log("Note saved!", doc)
          res.redirect("/articles/" + req.params.id);
        }
      });
    }
  });
});

router.delete("/articles/:id/comments/:cid", function(req, res) {
  var id = req.params.id;
  var cid = req.params.cid;
  Note.findByIdAndRemove(cid, function(error, note) {
    if (error) {
      res.send(error)
    } else {
      Article.findOneAndUpdate({ _id: id}, {$pull: { "note": cid}}, function(err, newDoc) {
        if (error) {
          res.send(error);
        } else {
          console.log("Note deleted!", note);
          res.redirect("/articles/" + id);
        }
      });
    }
  })
})



module.exports = router;