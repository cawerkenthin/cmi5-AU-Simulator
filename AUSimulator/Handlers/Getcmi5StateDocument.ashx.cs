using System;
using System.Text;
using System.Web;

namespace AUSimulator.Handlers
{
    /// <summary>
    /// Calls the xAPI State api to get the cmi5 LMS.LaunchData document 
    /// </summary>
    public class GetCMI5StateDocument : cmi5BaseHandler
    {
        public override void ProcessRequest(HttpContext ct)
        {
            ct.Response.ContentType = "text/plain";

            SetCommonParms(ct.Request.QueryString);

            var lrs = GetLRS();

            var lrsResult = lrs.RetrieveState("LMS.LaunchData", activity, actor, registration);

            var oSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();

            if (!lrsResult.success)
            {
                var err = new cmi5StateDoc
                {
                    ErrorCode = "1",
                    ErrorText = lrsResult.errMsg
                };

                ct.Response.Write(oSerializer.Serialize(err));
            }

            //var chars = new char[lrsResult.content.content.Length / sizeof(char)];
            //Buffer.BlockCopy(lrsResult.content.content, 0, chars, 0, lrsResult.content.content.Length);
            var state = Encoding.UTF8.GetString(lrsResult.content.content);

            var stateResp = new cmi5StateDoc
            {
                ErrorCode = "0",
                ErrorText = "",
                StateDocument = state
            };

            ct.Response.Write(oSerializer.Serialize(stateResp));
        }
    }

    public struct cmi5StateDoc
    {
        public string ErrorCode { get; set; }
        public string ErrorText { get; set; }
        public string StateDocument { get; set; }
    }
}