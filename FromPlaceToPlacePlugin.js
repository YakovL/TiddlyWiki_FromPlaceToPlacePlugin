/***
|Name        |FromPlaceToPlacePlugin|
|Description |allows opening a tiddler or a page in place of the current one (as opposed to opening in addition)|
|Version     |1.2.1|
|Source      |https://github.com/YakovL/TiddlyWiki_FromPlaceToPlacePlugin/blob/master/FromPlaceToPlacePlugin.js|
|Author      |Yakov Litvin|
|Contact     |Create an [[issue|https://github.com/YakovL/TiddlyWiki_FromPlaceToPlacePlugin/issues]] or start a new thread in the [[Google Group|https://groups.google.com/g/tiddlywikiclassic/]]|
|Copyright   |Yakov Litvin, 2023|
|Licence     |[[MIT|https://github.com/YakovL/TiddlyWiki_FromPlaceToPlacePlugin/blob/master/LICENSE]]|
!!!Introduction
In ~TiddlyWiki, links work "comulatively": when you click an internal link, you get +1 tiddler opened, external links open pages without closing ~TiddlyWiki (hence +1 browser tab). At times, this causes unnecessary "flooding" with opened things (tiddlers/pages). To solve this, FromPlaceToPlacePlugin was created.

It works in a simple way: it keeps the common functionality of the "click a link" action, but "hold meta key + click a link" causes "close and open" action:
* for internal links, this means "close the tiddler in which the link is placed and open the target tiddler"
* for external links, this means "open the page in the same browser tab"
!!!Installation & usage
Aside the usual import/copy-and-add-{{{systemConfig}}}-tag action, you need to adjust the meta keys for internal and external links (and reload afterwards). To do this, change the "Config" section of this tiddler ({{{txtFromTiddlerToTiddlerKey}}} for internal and {{{txtFromPageToPageKey}}} for external links), if necessary. Note that:
* {{{shift}}} doesn't work well for external links in Opera: on shift+click it opens the link in a new tab, so this will result in two equal tabs opened (with Opera, I recommend {{{alt}}})
* {{{alt}}} doesn't work well with IE, so you probably would prefer {{{shift}}}
* each {{{alt}}}, {{{ctrl}}} and {{{shift}}} work (with the limitations above); any other value of an option deactivates corresponding feature
Once the meta keys are set and TW is reloaded, try to click links..
!!!Demo
* click this [[internal link|Introduction to FromPlaceToPlacePlugin]] when pressing {{{shift}}} (or whatever meta key you've set)
* click this [[external link|http://yakovl.bplaced.net/TW/STP/STP.html]] when holding {{{alt}}} key
!!!Additional notes
* this works even with implicit links (like those in the "references" popup)
* "external links" are links with the {{{externalLink}}} class, so links created with inline-html won't work unless the class is added
!!!Config
***/
//{{{
config.extensions.txtFromPageToPageKey = 'alt'         // each 'alt', 'ctrl' and 'shift' work
config.extensions.txtFromTiddlerToTiddlerKey = 'shift' // each 'alt', 'ctrl' and 'shift' work
//}}}
/***
!!!Code
***/
//{{{
;(function(){
if(version.extensions.FromPlaceToPlacePlugin) return
version.extensions.FromPlaceToPlacePlugin = { major: 1, minor: 2, revision: 0, date: new Date(2023, 02, 28) }

var firedWhenKeyWasPressed = function(event, key) {

    return (event.shiftKey && key == 'shift') ||
            (event.ctrlKey && key == 'ctrl') ||
            (event.altKey && key == 'alt')
}

//------------------------------------------------------------------------------------------------------------
// From tiddler to tiddler

// keep as a global var for a possibility of introspection
orig_onClickTiddlerLink = onClickTiddlerLink

// decorate
onClickTiddlerLink = function(ev) {

    var sourceTid = story.findContainingTiddler(this),
        event = ev || window.event,
        key = config.extensions.txtFromTiddlerToTiddlerKey,
        close = !!(firedWhenKeyWasPressed(event, key) && sourceTid)

    // to "correct" page and zoomer position,
    // hide the "source" tiddler before opening the "target" and closing the "source"
    if(close) sourceTid.style.display = "none"
    var result = orig_onClickTiddlerLink(event)
    if(close) {
        var tName = sourceTid.getAttribute("tiddler")
        story.closeTiddler(tName)
    }
    return result
}

//------------------------------------------------------------------------------------------------------------
// From page to page
jQuery("body").delegate("a.externalLink", "click", function(ev) {

    var event = ev || window.event,
        key = config.extensions.txtFromPageToPageKey,
        close = firedWhenKeyWasPressed(event, key),
        target = jQuery(this).attr("href")

    if(close) {
        window.location.assign(target)
        return false
    }
})

})()
//}}}
