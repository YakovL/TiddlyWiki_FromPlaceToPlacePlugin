/***
|Name        |FromPlaceToPlacePlugin|
|Description |allows opening a tiddler or a page in place of the current one (as opposed to opening in addition)|
|Source      |https://github.com/YakovL/TiddlyWiki_FromPlaceToPlacePlugin/blob/master/FromPlaceToPlacePlugin.js|
|Author      |Yakov Litvin|
|Version     |1.3.0|
|Contact     |Create an [[issue|https://github.com/YakovL/TiddlyWiki_FromPlaceToPlacePlugin/issues]] or start a new thread in the [[Google Group|https://groups.google.com/g/tiddlywikiclassic/]]|
|License     |[[MIT|https://github.com/YakovL/TiddlyWiki_YL_ExtensionsCollection/blob/master/Common%20License%20(MIT)]]|
!!!Introduction
In ~TiddlyWiki, links work "cumulatively": when you click an internal link, you get +1 tiddler opened, external links open pages without closing ~TiddlyWiki (hence +1 browser tab). At times, this causes unnecessary "flooding" with opened things (tiddlers/pages). To solve this, FromPlaceToPlacePlugin was created.

It works in a simple way: it keeps the common functionality of the "click a link" action, but "hold meta key + click a link" causes "close and open" action:
* for internal links, this means "close the tiddler in which the link is placed and open the target tiddler"
* for external links, this means "open the page in the same browser tab"
!!!Installation & usage
Installation is done via the usual steps: copy tiddler with the {{{systemConfig}}} tag, save reload. Try clicking links! Notes:
* the demo page doesn't support import due to its development setup;
* if you want to get automatical updates, consider installing [[ExtensionsExplorerPlugin|https://github.com/YakovL/TiddlyWiki_ExtensionsExplorerPlugin]].

The meta keys that cause "opening in place" can be configured:
|affected links |edit here                  |if empty, defaults to|option name|
|external       |<<option txtFromPageToPageKey>>      |{{{alt}}}  |{{{txtFromPageToPageKey}}}|
|inner (tiddler)|<<option txtFromTiddlerToTiddlerKey>>|{{{shift}}}|{{{txtFromTiddlerToTiddlerKey}}}|
Supported values: {{{alt}}}, {{{ctrl}}}, and {{{shift}}} (using an unsupported value deactivates the corresponding feature).

Note that:
* {{{shift}}} doesn't work well for external links in Opera: on shift+click it opens the link in a new tab, so this will result in two equal tabs opened (with Opera, I recommend {{{alt}}})
* {{{alt}}} doesn't work well with IE, so you probably would prefer {{{shift}}}
!!!Demo
For a quick test, check out the [[demo page|https://yakovl.github.io/TiddlyWiki_FromPlaceToPlacePlugin/#FromPlaceToPlacePlugin]] or
* click this [[internal link|MainMenu]] while pressing {{{shift}}} (or whatever meta key you've set)
* click this [[external link|https://github.com/YakovL/TiddlyWiki_ExtensionsExplorerPlugin]] while holding {{{alt}}} key
!!!Additional notes
* this works even with implicit links (like those in the "references" popup)
* "external links" are links with the {{{externalLink}}} class, so links created with inline-html won't work unless the class is added
!!!Code
***/
//{{{
;(function() {
// install only once
if(version.extensions.FromPlaceToPlacePlugin) return
version.extensions.FromPlaceToPlacePlugin = {
    major: 1, minor: 2, revision: 2, date: new Date(2023, 03, 3)
}

// avoid "undefined" in <<option>> input
config.options.txtFromPageToPageKey = config.options.txtFromPageToPageKey || ''
config.options.txtFromTiddlerToTiddlerKey = config.options.txtFromTiddlerToTiddlerKey || ''

var wasKeyHeld = function(event, key) {

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
        key = config.options.txtFromTiddlerToTiddlerKey || 'shift',
        shouldClose = !!(wasKeyHeld(event, key) && sourceTid)

    // to "correct" page and zoomer position,
    // hide the "source" tiddler before opening the "target" and closing the "source"
    if(shouldClose) sourceTid.style.display = "none"
    var result = orig_onClickTiddlerLink(event)
    if(shouldClose) {
        var tName = sourceTid.getAttribute("tiddler")
        story.closeTiddler(tName)
    }
    return result
}

//------------------------------------------------------------------------------------------------------------
// From page to page
jQuery("body").delegate("a.externalLink", "click", function(ev) {

    var event = ev || window.event,
        key = config.options.txtFromPageToPageKey || 'alt',
        shouldClose = wasKeyHeld(event, key),
        targetUrl = jQuery(this).attr("href")

    if(shouldClose) {
        window.location.assign(targetUrl)
        return false
    }
})

})()
//}}}
