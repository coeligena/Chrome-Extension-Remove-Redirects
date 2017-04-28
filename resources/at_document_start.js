/* ╔════════════════════════════════════════════════════════════════════╗
   ║ at_document_start                                                  ║
   ╟────────────────────────────────────────────────────────────────────╢
   ║ File's content is injected after any files from CSS,               ║
   ║ - but before any other DOM is constructed,                         ║
   ║ - or any other script is run.                                      ║
   ╚════════════════════════════════════════════════════════════════════╝
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */

NodeList.prototype.forEach = Array.prototype.forEach;

counter_total = 0;

query = (function(array,glue){
          return array.join(glue + ",") + glue;
        }(
          [
            'a[href][onmousedown*="rwt("]'                        /* Google              */
          , 'a[href][jsaction*="mousedown"][jsaction*="keydown"]'
          , 'a[href][href^="/imgres"][href*="imgurl="]'           /* Google Images - only modify link since some images might be from HTTP (not secure location) but Google acts as a secure-image-loading-proxy, but the click is OK to fix. */
          , 'a[href][onmousedown*="window.open("]'                /* other (very common) */
          , 'a[href][onmousedown*="self.open("]' 
          , 'a[href][onmousedown*="top.open("]' 
          , 'a[href][onmousedown*="parent.open("]' 
          , 'a[href][onmousedown*="frames.open("]' 
          , 'a[href][onmousedown*=".href="]'
          , 'a[href][onmousedown*="location="]'
          , 'a[href][onmousedown*="location.href="]'
          , 'a[href][onmousedown*="location.pathname="]'
          , 'a[href][onmousedown*="location.replace("]'
          , 'a[href][onmousedown*="location.reload("]'
          , 'a[href][onmousedown*="location.assign("]'
          , 'a[href][onclick*="window.open("]'                    /* other (uncommon)                      */
          , 'a[href][onclick*="self.open("]' 
          , 'a[href][onclick*="top.open("]' 
          , 'a[href][onclick*="parent.open("]' 
          , 'a[href][onclick*="frames.open("]' 
          , 'a[href][onclick*=".href="]'
          , 'a[href][onclick*="location="]'
          , 'a[href][onclick*="location.href="]'
          , 'a[href][onclick*="location.pathname="]'
          , 'a[href][onclick*="location.replace("]'
          , 'a[href][onclick*="location.reload("]'
          , 'a[href][onclick*="location.assign("]'
          , 'a[href][onclick*="openUrl("]'                                                     /* quora.com                             */
          , 'a[href]:not([onclick]):not([onmousedown]):not([jsaction])[href^="/url?q="]'       /* Google with no JavaScript URL - must be verified to be Google, using '.href'  --  this is special case, and a little bit wastefull, since I KNOW there is NO onclick,onmousedown(etc..) handles due to it is being in no javascript page, but to make the entire code at here more unified- I WILL STILL include this specific case as if it is still required to be handled-cleaned.. */
          , 'a[href][data-saferedirecturl]'                                                    /* gmail redirect on links - NOT SURE IT IS A GOOD IDEA TO REMOVE IT... :/ */
          , 'a[href][href*="disq.us/url"][href*="url="]'                                       /* disqus redirect */
          , 'a[href][data-url]:not([data-url=""])'                                             /* twitter/instagram links ("t.co"/) links   */
          , 'a[href][href*="instagram.com"][href*="u=http"]'                                   /* instagram internal-links*/
          , 'a[href][data-expanded-url]:not([data-expanded-url=""])'   
          , 'a[href^="/out/"][href*="u="]'                                                     /* generic PHP-out redirect plugins           */

          , 'a[href*="utm_"]'                                                                  /* generic behavioural tracking */
          ]
          ,
          ':not([href=""]):not([href^="#"]):not([href^="void("]):not([href^="javascript:"]):not([done-removeredirects])'
        ));


function unhook_all_events_by_clone(element){ "use strict";
  var tmp;
  tmp = element.cloneNode(true);                        //unhook all events! (only if page has javascript support)
  element.parentNode.replaceChild(tmp, element);
  element = tmp;
  return element;
}

function for_twitter(element){ "use strict";
  var tmp;
  tmp = element.getAttribute("data-url") || element.getAttribute("data-expanded-url");      /* twitter instagram pages*/
  if(null === tmp) return;
  tmp = (-1 === tmp.indexOf(":") ? "http://" : "") + tmp;                                 /* fix missing protocol */
  element.setAttribute("href", tmp);                                                      /* hard overwrite       */
  tmp = null;
}

function for_instagram_internal_links(element){ "use strict";
  var tmp;
  tmp = element.href.match(/instagram\.com\/[^\"\&]*u=([^\&]+)/i);                        /* instagram internal "click" links using useless redirect. */
  if(null === tmp || "string" !== typeof tmp[1]) return;
  tmp = tmp[1];
  tmp = decodeURIComponent(tmp);
  element.setAttribute("href", tmp); /* hard overwrite */
  tmp = null;
}


function for_google_nojs(element){ "use strict";
  var tmp;
  tmp = element.href.match(/\/\/www\.google\.[^\/]+\/url\?q\=([^\&]+)/i);                   /* Google page (redirects with no javascript)*/
  if(null === tmp || "string" !== typeof tmp[1]) return;
  tmp = tmp[1];
  tmp = decodeURIComponent(tmp);
  element.setAttribute("href", tmp); /* hard overwrite */
  tmp = null;
}

function for_google_picture_redirect(element){ "use strict";
  var tmp;
  tmp = element.getAttribute("href");
  tmp = tmp.match(/^\/imgres.*imgurl=([^\"\&]+)/i);
  if(null === tmp || "string" !== typeof tmp[1]) return;
  tmp = tmp[1];
  tmp = decodeURIComponent(tmp);
  element.setAttribute("href", tmp); /* hard overwrite */
  tmp = null;
}

function for_datasaferedirect(element){ "use strict";
  if(null === element.getAttribute("data-saferedirecturl")) return;
  element.removeAttribute("data-saferedirecturl");
}

function for_disqus(element){ "use strict";
  var tmp;
  tmp = element.search.match(/url\=([^\&\^]+)/i);                                         /* disqus redirect links */
  if(null === tmp || "string" !== typeof tmp[1]) return;
  tmp = tmp[1];
  tmp = decodeURIComponent(tmp);
  element.setAttribute("href", tmp); /* hard overwrite */
  tmp = null;
}

function for_php_outplugin(element){ "use strict";
  var tmp;
  tmp = element.getAttribute("href").match(/u=([^\&]+)/i);
  if(null === tmp || "string" !== typeof tmp[1]) return;
  tmp = tmp[1];
  tmp = decodeURIComponent(tmp);
  element.setAttribute("href", tmp); /* hard overwrite */
  tmp = null;
}

function remove_utm_tracking(element){ "use strict";
  var tmp;
  tmp = element.getAttribute("href");
  if(-1 === tmp.indexOf("utm_")) return; //no need to do anything.

  tmp = tmp.replace(/utm_[^\%]+\%3d[^\%\&]+/gi, "").replace(/(\%26)+$/g,""); //when appeared as component.
  tmp = tmp.replace(/utm_[^\=]+\=[^\%\&]+/gi,   "").replace(/(\&)+$/g,"");   //when appeared as plain-argument.
  element.setAttribute("href", tmp);
}


function action(){ "use strict";
  var elements = document.querySelectorAll(query);
  if(null === elements || 0 === elements.length) return;
  counter_total += elements.length;
  try{chrome.runtime.sendMessage({badge_data: counter_total});}catch(err){} /* update extension's badge. */

  elements.forEach(function(element){
    element.setAttribute("done-removeredirects", "");        /* flag to make sure to avoid infinate loop in-case the real-url also includes "/url?q=" in it.  */

    element.removeAttribute("onmousedown");
    element.removeAttribute("jsaction");
    element.removeAttribute("onclick");
    for_twitter(element);
    for_instagram_internal_links(element);
    for_google_nojs(element);
    for_google_picture_redirect(element);
    for_datasaferedirect(element);
    for_disqus(element);
    for_php_outplugin(element);
    remove_utm_tracking(element);

    setTimeout(function(){
      var tmp;
      tmp = unhook_all_events_by_clone(element);
      tmp.removeAttribute("onmousedown");                   /* must be redo since cloneNode will get the unmodified version of the node from the initial-HTML-source, attributes included.. */
      tmp.removeAttribute("jsaction");
      tmp.removeAttribute("onclick");
      for_twitter(tmp);
      for_instagram_internal_links(tmp);
      for_google_nojs(tmp);
      for_google_picture_redirect(tmp);
      for_datasaferedirect(element);
      for_disqus(tmp);
      for_php_outplugin(element);
      remove_utm_tracking(element);
    }, 50);
  });
}

try{  action();                               }catch(err){}
try{  interval_id = setInterval(action, 250); }catch(err){ clearInterval(interval_id); }  //Only available in pages having JavaScript support.