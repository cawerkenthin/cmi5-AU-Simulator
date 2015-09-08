using System;
using System.Collections.Generic;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using AUSimulator.Classes.Pages;

namespace AUSimulator
{
    public partial class cmi5AUSimulator : AUSimBasePage
    {
        protected override void Page_Load(object sender, EventArgs e)
        {
            base.Page_Load(sender, e);

            // Parse cmi5 command line parameters
            var fetchUrl = Request.QueryString["fetch"];

            txtAuthToken.ToolTip = fetchUrl;


        }
    }
}