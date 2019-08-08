'use strict';

const middleware = require('socketio-wildcard')();
const history = require('../api/article/history/history.controller');
const User = require('../api/user/user.model');

/**
 * @class SocketUser
 * @description this class is used to stock with generic parameters a list of users.
 * @author Léo Riberon-Piatyszek
 */
class SocketUser {
  constructor (id) {
    this.id = id;
    this.idUser = '';
    this.name = '';
    console.log('[socket.io] NEW USER JUST CONNECTED: %s', this.id)
  }

  setArticleId (idArticle) { this.idArticle = idArticle }

  async setUserId (idUser) {
    this.idUser = idUser;
    this.name = await new Promise(async resolve => {
      const user = await User.findOne({_id: idUser});
      resolve(`${user.firstname[0].toUpperCase()}. ${user.lastname.toUpperCase()}`)
    })
  }
}

/**
 *
 * @type {{SocketUser}}
 */
const mapUser = {};

/**
 * Main calls from the sockets
 * @param io -> the socket declaration
 */
module.exports = function (io) {
  /**
   * This socket.io's usage is created to implement wildcard
   * to implement a map of function.
   */
  io.use(middleware);

  /**
   * @function This function permit to manage the connections.
   * @param socket -> Contain the client informations
   */
  io.on('connection', (socket) => {
    mapUser[socket.id] = new SocketUser(socket.id);

    /**
     * Enumeration of every events to add in history
     * NEW_ instruction => emit ADD_ instruction
     * UPDATE_ instruction => emit MODIFY_ instruction
     * REMOVE_ instruction => emit DELETE_ instruction
     * EXEC_ instruction => emit LOAD_ instruction
     * QUILL_NEW_ instruction => emit QUILL_EXEC_ instruction
     * GET_USERS instruction => emit all connected user from RESULT_USERS instruction
     * @type {{SET_ARTICLE: SET_ARTICLE, NEW_ASSOCIATE_EDITOR: (function(*=): *), NEW_ONE_BLOCK: (function(*=): *), REMOVE_ROW: (function(*=): *), UPDATE_STATUS: (function(*=): *), QUILL_NEW_TEXT: (function(*=): *), REMOVE_DATA: (function(*=): *), EXEC_PDF: (function(*=): *), NEW_REVIEWER: (function(*=): *), NEW_COLLABORATOR: (function(*=): *), ABSTRACT_EDIT: (function(*=): *), EXEC_CODE_PYTHON: (function(*=): *), NEW_ROW: (function(*=): *), NEW_TAG: (function(*=): *), NEW_BLOCK_TEXT: (function(*=): *), UPDATE_COLLABORATOR: (function(*=): *), REMOVE_COLLABORATOR: (function(*=): *), SECTION_EDIT: (function(*=): *), UPDATE_BLOCK_PICTURE: (function(*=): *), REMOVE_BLOCK: (function(*=): *), UPDATE_TITLE: (function(*=): *), QUILL_NEW_SELECT: (function(*=): *), NEW_BLOCK_CHART: (function(*=): *), NEW_TWO_BLOCK: (function(*=): *), EXEC_CODE_R: (function(*=): *), NEW_DATA: (function(*=): *), UPDATE_VERSION: (function(*=): *), NEW_VERSION: (function(*=): *), NEW_BLOCK_PICTURE: (function(*=): *), GET_USERS: GET_USERS, NEW_COMMENT: (function(*=): *)}}
     * @author Léo Riberon-Piatyszek
     */
    const ENUM_INSTRUCTION = {
      SECTION_EDIT: data => socket.to(mapUser[socket.id].idArticle).emit(`SECTION_UPDATE`, data),
      ABSTRACT_EDIT: data => socket.to(mapUser[socket.id].idArticle).emit(`ABSTRACT_UPDATE`, data),
      NEW_ROW: data => socket.to(mapUser[socket.id].idArticle).emit(`ADD_ROW`, data),
      NEW_TAG: data => socket.to(mapUser[socket.id].idArticle).emit(`ADD_TAG`, data),
      NEW_ONE_BLOCK: data => socket.to(mapUser[socket.id].idArticle).emit(`ADD_ONE_BLOCK`, data),
      NEW_TWO_BLOCK: data => socket.to(mapUser[socket.id].idArticle).emit(`ADD_TWO_BLOCK`, data),
      NEW_BLOCK_TEXT: data => socket.to(mapUser[socket.id].idArticle).emit(`ADD_BLOCK_TEXT`, data),
      NEW_BLOCK_CHART: data => socket.to(mapUser[socket.id].idArticle).emit(`ADD_BLOCK_CHART`, data),
      NEW_BLOCK_PICTURE: data => socket.to(mapUser[socket.id].idArticle).emit(`ADD_BLOCK_PICTURE`, data),
      NEW_COMMENT: data => socket.to(mapUser[socket.id].idArticle).emit(`ADD_COMMENT`, data),
      NEW_COLLABORATOR: data => socket.to(mapUser[socket.id].idArticle).emit(`ADD_COLLABORATOR`, data),
      NEW_DATA: data => socket.to(mapUser[socket.id].idArticle).emit(`ADD_DATA`, data),
      NEW_REVIEWER: data => socket.to(mapUser[socket.id].idArticle).emit(`ADD_REVIEWER`, data),
      NEW_ASSOCIATE_EDITOR: data => socket.to(mapUser[socket.id].idArticle).emit(`ADD_ASSOCIATE_EDITOR`, data),
      NEW_VERSION: data => socket.to(mapUser[socket.id].idArticle).emit(`ADD_VERSION`, data),
      REMOVE_BLOCK: data => socket.to(mapUser[socket.id].idArticle).emit(`DELETE_BLOCK`, data),
      REMOVE_ROW: data => socket.to(mapUser[socket.id].idArticle).emit(`DELETE_ROW`, data),
      REMOVE_DATA: data => socket.to(mapUser[socket.id].idArticle).emit(`DELETE_DATA`, data),
      REMOVE_COLLABORATOR: data => socket.to(mapUser[socket.id].idArticle).emit(`DELETE_COLLABORATOR`, data),
      UPDATE_BLOCK_PICTURE: data => socket.to(mapUser[socket.id].idArticle).emit(`MODIFY_BLOCK_PICTURE`, data),
      UPDATE_TITLE: data => socket.to(mapUser[socket.id].idArticle).emit(`MODIFY_TITLE`, data),
      UPDATE_COLLABORATOR: data => socket.to(mapUser[socket.id].idArticle).emit(`MODIFY_COLLABORATOR`, data),
      UPDATE_STATUS: data => socket.to(mapUser[socket.id].idArticle).emit(`MODIFY_STATUS`, data),
      UPDATE_VERSION: data => socket.to(mapUser[socket.id].idArticle).emit(`MODIFY_VERSION`, data),
      EXEC_CODE_R: data => socket.to(mapUser[socket.id].idArticle).emit(`LOAD_CODE_R`, data),
      EXEC_CODE_PYTHON: data => socket.to(mapUser[socket.id].idArticle).emit(`LOAD_CODE_PYTHON`, data),
      EXEC_PDF: data => socket.to(mapUser[socket.id].idArticle).emit(`LOAD_PDF`, data),
      QUILL_NEW_TEXT: data => socket.to(mapUser[socket.id].idArticle).emit(`QUILL_EXEC_TEXT`, data),
      QUILL_NEW_SELECT: data => socket.to(mapUser[socket.id].idArticle).emit(`QUILL_EXEC_SELECT`, data),
      SET_ARTICLE: async data => {
        mapUser[socket.id].setArticleId(data.id_article);
        socket.join(data.id_article);
        await mapUser[socket.id].setUserId(data.id_user);
      },
      GET_USERS: data => {
        try {
          const userList = [];
          for (let user in mapUser)
            if (mapUser.hasOwnProperty(user) && data.id_article === mapUser[user].idArticle)
              userList.push(user);
          socket.to(mapUser[socket.id].idArticle).emit('RESULT_USERS', userList);
        } catch (e) {
          console.error(e);
        }
      }
    };

    socket.on('disconnect', () => {
      console.log('[socket.io] AN USER JUST DISCONNECTED: %s', mapUser[socket.id].id);
      delete mapUser[socket.id];
    });

    socket.on('*', data => {
      const event = data.data[0];
      const jsonArgs = data.data[1];
      if (Object.keys(ENUM_INSTRUCTION).includes(event)) {
        ENUM_INSTRUCTION[event](jsonArgs);
        history.addInstruction(mapUser[socket.id], event);
      }
    });
  })
};
