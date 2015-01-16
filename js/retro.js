/*!	Retro Context for HTML5 Canvas. Version 0.5.1 ALPHA
 *	Copyright (c) 2013-2015 Epistemex
 *	Licensed under GPL 3.0
 */

/**
 * @name Retro Context for HTML5 Canvas.
 * @copyright Copyright &copy; 2013-2014 Epistemex
 * @license GPL-3.0 License
 */

/**
 * Global retro namespace used for the context and its classes.
 * @namespace
 * @property {String} retro.version - Version as major.minor[.patch] [release type]
 */
var retro = {
	version: '0.5 ALPHA'
};

/**
 * Event object for mouse
 *
 * @event retro.Context#mouseEvent
 * @type {Object}
 * @prop {Number} buttons - which mouse button is pressed
 * @prop {Boolean} altKey - if alt key was pressed
 * @prop {Boolean} ctrlKey - if ctrl key was pressed
 * @prop {Boolean} metaKey - if meta key was pressed
 * @prop {Boolean} shiftKey - if shift key was pressed
 * @prop {Number} x - x position adjusted for resolution
 * @prop {Number} y - y position adjusted for resolution
 * @prop {Object} event - original event object
 * @prop {retro.Context} source - reference to context sending event
 * @prop {Number} timeStamp - original timestamp
 * @prop {Method} preventDefault
 * @prop {Method} stopPropagation
 */

/**
 * Event object for key
 *
 * @event retro.Context#keyEvent
 * @type {Object}
 * @prop {Boolean} altKey - if alt key was pressed
 * @prop {Boolean} ctrlKey - if ctrl key was pressed
 * @prop {Boolean} metaKey - if meta key was pressed
 * @prop {Boolean} shiftKey - if shift key was pressed
 * @prop {Number} charCode - ASCII code of key
 * @porp {Number} key - key code
 * @prop {Number} x - x position adjusted for resolution
 * @prop {Number} y - y position adjusted for resolution
 * @prop {Object} event - original event object
 * @prop {retro.Context} source - reference to context sending event
 * @prop {Number} timeStamp - original timestamp
 * @prop {Method} preventDefault
 * @prop {Method} stopPropagation
 */
