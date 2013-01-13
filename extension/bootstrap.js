/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

Cu.import("resource://gre/modules/Services.jsm");

var GNOMEThemeTweak = {
    availableStyles: ["fxbutton", "newtab-page", "restore-button", "tabs-border", "urlbar-history-dropmarker"],
    appliedStyles: [],
    
    loadStyle: function(name) {
        let sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
        let uri = Services.io.newURI("resource://gnome-theme-tweak/content/tweaks/"+name+".css", null, null);
        if (!sss.sheetRegistered(uri, sss.USER_SHEET))
            sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
    },
    
    unloadStyle: function(name) {
        let sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
        let uri = Services.io.newURI("resource://gnome-theme-tweak/content/tweaks/"+name+".css", null, null);
        if (sss.sheetRegistered(uri, sss.USER_SHEET))
            sss.unregisterSheet(uri, sss.USER_SHEET);
    },

    init: function() {
        let preferences = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.gnome-theme-tweak.");
        
        for (var i = 0; i < this.availableStyles.length; i++) {
            if(preferences.getPrefType(this.availableStyles[i]) && preferences.getBoolPref(this.availableStyles[i]) == true) {
                this.loadStyle(this.availableStyles[i]);
                this.appliedStyles.push(this.availableStyles[i]);
            }
        }
    },
    
    uninit: function() {
        for (var i = 0; i < this.appliedStyles.length; i++) {
            this.unloadStyle(this.appliedStyles[i]);
        }
    },
}

let ResourceAlias = {
    register: function(alias, data) {
        let ios = Services.io;
        if (!alias) return false;
        this._alias = alias;
        if (this._resProtocolHandler) return false;
        this._resProtocolHandler = ios.getProtocolHandler("resource");
        this._resProtocolHandler.QueryInterface(Ci.nsIResProtocolHandler);
        let uri = data.resourceURI;
        if (!uri) { // packed
            if (data.installPath.isDirectory()) {
                uri = ios.newFileURI(data.installPath);
            } else { // unpacked
                let jarProtocolHandler = ios.getProtocolHandler("jar");
                jarProtocolHandler.QueryInterface(Ci.nsIJARProtocolHandler);
                let spec = "jar:" + ios.newFileURI(data.installPath).spec + "!/";
                uri = jarProtocolHandler.newURI(spec, null, null);
            }
        }
        this._resProtocolHandler.setSubstitution(alias, uri);
        return true;
    },
    unregister: function() {
        if (!this._resProtocolHandler) return false;
        this._resProtocolHandler.setSubstitution(this._alias, null);
        delete this._resProtocolHandler;
        delete this._alias;
        return true;
    }
}

function startup(data, reason) {
    ResourceAlias.register("gnome-theme-tweak", data);
    GNOMEThemeTweak.init();
}

function shutdown(data, reason) {
    ResourceAlias.unregister();
    GNOMEThemeTweak.uninit();
}

function install(data, reason) {
    /*
    let preferences = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.gnome-theme-tweak.");
    preferences.setBoolPref("fxbutton", true);
    preferences.setBoolPref("tabs-border", true);
    */
}

function uninstall(data, reason) {
    /*
    try {
        let preferences = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
        preferences.QueryInterface(Ci.nsIPrefBranch);
        preferences.deleteBranch("extensions.gnome-theme-tweak.");
    } catch (e) {}
    */
}