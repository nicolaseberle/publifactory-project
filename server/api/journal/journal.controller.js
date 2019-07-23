'use strict';

const UserModel = require('../user/user.model')
const UserController = require('../user/user.controller')
const Article = require('../article/article.model')
const Journal = require('./journal.model')
const RolesJournal = require('../roles/journal/roles.journal.model')
const RolesArticle = require('../roles/article/roles.article.model')
const Invitation = require('../invitations/invitations.model')
const Email = require('../email/email.controller')

const shortid = require('shortid')
const configEmail = require('../../../config.js').email

/**
 * Get list of articles
 * restriction: 'admin'
 */

//const Category = require('../category/category.model');

//const ArticleValidator = require('./article.validator');

/* HELPERS */
const renameObjectProperty = require('../../helpers/renameObjectProperty');

const DEFAULT_PAGE_OFFSET = 1;
const DEFAULT_LIMIT = 10;

/**
 * getArticles - Returns an array of articles requested with a page offset and limit,
 * so that results are paginated
 *
 * @function getJournals
 * @memberof module:controllers/articles
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

exports.getJournals = async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || DEFAULT_PAGE_OFFSET;
  const limit = parseInt(req.query.limit, 10) || DEFAULT_LIMIT;

  try {
    let journals;
    if (req.params.id === undefined) {
      journals = await Journal.paginate({ deleted: false, published: true }, {
        page,
        limit,
        lean: true
      });
      console.log(JSON.stringify(journals, null, "\t"))
      renameObjectProperty(journals, 'docs', 'journals');
    } else {
      //console.log(JSON.stringify("findJournalById", null, "\t"))
      journals = await Journal.findById(req.params.id)
        .populate('users')
        .populate('article')
        .lean();
      console.log(JSON.stringify(journals, null, "\t"))
      if (!journals)
        throw { code: 404, message: 'Journals not found.' };
    }
    return res.status(200).json(journals);
  } catch (err) {
    return next(err);
  }
};

/**
 * @function findJournalByIdAndUpdate
 * @memberof module:controllers/journal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
module.exports.findJournalByIdAndUpdate = async (req, res, next) => {
  try {
    if (req.body.title === undefined || req.body.abstract === undefined ||
      req.body.published === undefined)
      throw { code: 422, message: 'Missing parameters.' };
    const title = req.body.title;
    const abstract = req.body.abstract;
    const published = req.body.published;
    const journal = await Journal
      .findOneAndUpdate(
        { _id: req.params.id },
        { $set: { title, abstract, published } },
        { new: true }
      );
    if (!journal)
      throw { code: 404, message: 'Journal not found.' }
    return res.json(journal);
  } catch (err) {
    return next(err);
  }
};


/**
 * @function createJournal
 * @memberof module:controllers/journal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
module.exports.createJournal = async (req, res, next) => {
  try {
    //req.check(ArticleValidator.checkArticleData);
    //const validationResult = await req.getValidationResult();
    /*if (!validationResult.isEmpty()) {
      return res.status(400).json({ errors: validationResult.array() });
    }*/

    if (req.body.title === undefined || req.body.abstract === undefined ||
      req.body.published === undefined || req.body.tags === undefined)
      throw { code: 422, message: 'Missing parameters.' };
    const title = req.body.title.trim();
    const abstract = req.body.abstract.trim();
    const tags = req.body.tags;
    const published = req.body.published;
    const newJournal = new Journal({ title, abstract, tags, published});
    newJournal.users[0] = req.decoded._id;
    const journal = await newJournal.save();
    new RolesJournal({ id_user: req.decoded._id, id_journal: journal._id, right: 'editor' }).save();
    res.status(201).json({ success: true, journal: journal });
  } catch (err) {
    next(err);
  }
};

/**
 * @function deleteJournal
 * @author Léo Riberon-Piatyszek
 * @memberOf module:controllers/journal
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
module.exports.deleteJournal = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    await Journal.findOneAndRemove(query);
    await RolesJournal.deleteMany({ id_journal: req.params.id });
    res.status(204).json({ success: true });
  } catch (e) {
    next(e);
  }
}

/**
 * @function addArticleToJournal
 * @author Léo Riberon-Piatyszek
 * @memberOf module:controllers/journal
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
module.exports.addArticleToJournal = async (req, res, next) => {
  try {
    if (req.body.id_article === undefined)
      throw { code: 422, message: 'Missing parameters.'}
    let query = { id_journal: req.params.id, right: 'editor' };
    const journalInfo = await RolesJournal.find(query);
    if (journalInfo.length === 0)
      throw { code: 404, message: "Journals not found." };
    for (let i = 0, len = journalInfo.length; i < len; ++i)
      new RolesArticle({ id_user: journalInfo[i].id_user, id_article: req.body.id_article, right: 'editor'}).save()
    query = { _id: req.params.id }
    const toAdd = { $push: { content: { published: false, reference: req.body.id_article } } };
    const options = { new: true };
    await Journal.findOneAndUpdate(query, toAdd, options).exec();
    await Article.findOneAndUpdate({_id: req.body.id_article}, { $set: { journal: req.params.id } }).exec();
    res.json({success: true})
  } catch (e) {
    next(e)
  }
}

/**
 * @function removeArticleFromJournal
 * @author Léo Riberon-Piatyszek
 * @memberOf module:controllers/journal
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
module.exports.removeArticleFromJournal = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    const toPull = { $pull: { content: { reference: { $in: [req.params.id_article] } } } };
    const options = { multi: false };
    await Journal.findOneAndUpdate(query, toPull, options);
    res.json({ success: true });
  } catch (e) {
    next(e)
  }
}

module.exports.getJournalsUser = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.params.role !== undefined)
      query.right = req.params.role;
    const users = await RolesJournal.find(query).exec();
    res.json({ success: true, users: users });
  } catch (e) {
    next(e);
  }
}

module.exports.setArticlePublish = async (req, res, next) => {
  try {
    const query = { _id: req.params.id, content: { reference: { $in: [req.params.id_article] } } };
    const toUpdate = { $set: { content: { published: true } } };
    await RolesJournal.findOneAndUpdate(query, toUpdate);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

module.exports.inviteUser = async (req, res, next) => {
  try {
    if (req.body.link === undefined || req.body.msg === undefined ||
      req.body.to === undefined || req.body.name === undefined)
      throw { code: 422, message: 'Missing parameters.' };
    let senderId = req.body.link,
      senderMsg = req.body.msg,
      receiverEmail = req.body.to,
      senderName = req.body.name,
      newLink = shortid.generate();
    //to avoid '-' in the link
    while(newLink.indexOf('-')>=0){
      newLink = shortid.generate();
    }
    let current = new Date().toISOString()
    const newInvitation = new Invitation({
      "created_at": current,
      "updated_at": current,
      "link": newLink,
      "recieptEmail": receiverEmail,
      "senderId": senderId,
      "senderMsg": senderMsg,
      "senderName": senderName
    });
    await newInvitation.save(async (error, result) => {
      if (error) {
        return console.log(error);
      } else {
        //we send the email to invite the new author to access
        const mail = new Email(receiverEmail);
        const clientUrl = `${configEmail.rootHTML}/invite/${senderId}-${newLink}?redirect=${req.params.id}`;
        if (req.params.right === 'user') {
          await mail.sendInvitationJournalUser(senderId, clientUrl)
        } else {
          let userInfo = await UserModel.findOne({ email: req.body.to });
          if (!userInfo) {
            req.body.email = receiverEmail;
            req.body.password = shortid;
            req.body.firstname = 'None';
            req.body.lastname = 'None';
            userInfo = await UserController.createGuest(req, res, next);
          }
          const role = new RolesJournal({ id_user: userInfo._id, id_journal: req.params.id, right: 'associate_editor' });
          await role.save();
          await mail.sendInvitationJournalAssociateEditor(senderId, clientUrl)
        }
      }
    })
    res.json({ success: true })
  } catch (e) {
    next(e);
  }
}

module.exports.followJournal = async (req, res, next) => {
  try {
    let instruction, query = { id_journal: req.params.id, id_user: req.decoded._id }
    const roleInfo = await RolesJournal.findOne(query).exec();
    if (roleInfo === null) {
      instruction = { $push: { users: req.decoded._id } }
      await new RolesJournal({ id_user: req.decoded._id, id_journal: req.params.id }).save()
    } else {
      instruction = { $pull: { users: { $in: [req.decoded._id] } } }
      await RolesJournal.findOneAndDelete(query);
    }
    query = { _id: req.params.id };
    await Journal.findOneAndUpdate(query, instruction);
    res.json({ success: true })
  } catch (e) {
    next(e);
  }
}

module.exports.addAssociateEditor = async (req,res,next) => {
  try{
    if (req.body.associate_editor === undefined)
      throw { code: 422, message: 'Missing parameters.' };
    const user = await UserModel.findOne({ email: req.body.associate_editor.email }).exec();
    const query = { _id: req.params.id };
    const toAdd = { $push: { users: user._id } };
    const options = { new: true };
    await Journal.findOneAndUpdate(query, toAdd, options);
    const newAE = await new RolesJournal({ id_user: user._id, id_journal: req.params.id, right: 'associate_editor' }).save();
    res.json({ success: true, user: newAE});
  }
  catch (e) {
    next(e);
  }
}

module.exports.removeAssociateEditor = async (req,res,next) => {
  try{
    if (req.body.associate_editor_id === undefined)
      throw { code: 422, message: 'Missing parameters.' };
    const user = await UserModel.findOne({ _id: req.body.associate_editor_id }).exec();
    let query = { _id: req.params.id };
    //we keep the user in journal.user matrix
    const toRemove = { $pull: { users: user._id } };
    await Journal.findOneAndUpdate(query, toRemove);
    query = { id_user: user._id, id_journal: req.params.id }
    await RolesJournal.findOneAndRemove( query );
    res.json({ success: true });
  }
  catch (e) {
    next(e);
  }
}

module.exports.updateTags = async (req, res, next) => {
  try {
    if (req.body.tags === undefined)
      throw { code: 422, message: 'Missing parameters.' };
    const query = { _id: req.params.id };
    const toReplace = { $set: { tags: req.body.tags } };
    await Journal.findOneAndUpdate(query, toReplace);
    res.json({ success: true })
  } catch (e) {
    next(e);
  }
};

module.exports.userFollowedJournals = async (req, res, next) => {
  try {
    const result = await RolesJournal.find({ id_user: req.decoded._id }).exec()
    res.json({success: true, journals: result});
  } catch (e) {
    console.log('userFollowedJournals :: error :: ',e)
    next(e)
  }
}
