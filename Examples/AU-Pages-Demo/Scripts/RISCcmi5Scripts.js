// Function to allow one JavaScript file to be included by another.
// Copyright (C) 2006-08 www.cryer.co.uk
function IncludeJavaScript(jsFile) {
    document.write('<script type="text/javascript" src="'
      + jsFile + '"></scr' + 'ipt>');
}
IncludeJavaScript("//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js");
IncludeJavaScript("Scripts/cmi5Controller.js");   // cmi5 controller library from RISC, Inc.  http://risc-inc.com
IncludeJavaScript("Scripts/verbs.js");            // verb library from ADL http://adlnet.org
IncludeJavaScript("Scripts/xapiwrapper.min.js");  // xapi wrapper library from ADL
