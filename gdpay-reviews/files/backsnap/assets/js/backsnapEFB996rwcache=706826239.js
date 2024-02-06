/*! *********************************************
    
    BACKSNAP v.1.2.1
    COPYRIGHT: 2014; Yabdab,Inc.
    MODIFIED: 2014-04-17 09:20:11

@preserve   
********************************************** */
!function(){"use strict";function e(){var e={request:"backsnap-frame-height"};d.contentWindow.postMessage(JSON.stringify(e),"*")}function t(e){var t=JSON.parse(e.data);t&&t.page==s&&"backsnap-frame-height"==t.response&&(d.style.height=t.height+"px")}var a=document.getElementsByTagName("script"),n=a[a.length-1],r=n.getAttribute("data-backsnap-path"),s=n.getAttribute("data-backsnap-page"),i,o=location.pathname;i=-1!=o.indexOf("RWDocumentPagePreview")?r+"/backsnap/preview.html?page="+s:r+"/backsnap/content.php?page="+s;var d=document.createElement("iframe");d.setAttribute("src",i),d.setAttribute("allowtransparency","true"),d.setAttribute("frameBorder","0"),d.style.width="100%",d.style.border="none",d.style.overflow="hidden",n.parentNode.insertBefore(d,n),window.addEventListener?(window.addEventListener("resize",e,!1),window.addEventListener("message",t,!1)):(window.attachEvent("onresize",e),window.attachEvent("onmessage",t))}();
