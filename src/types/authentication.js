  /**
   * @typedef AuthenticationStatus 
   * @type {Object}
   * @property {string} token - The token string 
   * @property {Number} role - The user's role. 
   * @property {string} label - The user's label. 
   * @property {string} firstname - The user's first name 
   * @property {string} lastname - The user's last name 
   * @property {Boolean} isAuth - If the user is successfully authenticated. 
   */


/**
 * @typedef TokenResponse
 * @type {Object}
 * @property {Boolean} success - Indicates if the token is valid. 
 * @property {Boolean} verified - Is the token verified. 
 * @property {Number} role - The defined user role. 
 * @property {string} firstname - The user's firstname 
 * @property {string} lastname - The user's lastname
 * @property {string} label - The user's label. 
 * @property {string} msg - Message from the API.
 */

  /**
   * @typedef TokenVaidResponse 
   * @type {Object}
   * @property {Boolean} success - Indicates if the token is valid. 
   * @property {Boolean} verified - Is the token verified. 
   * @property {Number} role - The defined user role. 
   * @property {string} firstname - The user's firstname 
   * @property {string} lastname - The user's lastname
   * @property {string} label - The user's label. 
   */



  export default { }
