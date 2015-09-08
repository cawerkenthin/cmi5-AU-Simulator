using System;

namespace AUSimulator.Classes.Pages
{
    public class AUSimBasePage : System.Web.UI.Page
    {
        protected virtual void Page_PreInit(object sender, EventArgs e)
        {
            Page.Theme = "AUSim";
        }

        protected virtual void Page_Load(object sender, EventArgs e)
        {
            Page.Header.DataBind();
        }
    }
}