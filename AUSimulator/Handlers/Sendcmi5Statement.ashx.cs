using System;
using System.Collections.Generic;
using System.Web;
using Newtonsoft.Json.Linq;
using TinCan;
using Extensions = TinCan.Extensions;

namespace AUSimulator.Handlers
{
    public class Sendcmi5Statement : cmi5BaseHandler
    {
        public override void ProcessRequest(HttpContext ct)
        {
            ct.Response.ContentType = "text/plain";

            SetCommonParms(ct.Request.QueryString);

            var sessionId = ct.Request.QueryString["sessionId"];
            var score = ct.Request.QueryString["score"];
            var verbName = ct.Request.QueryString["verb"];
            var success = ct.Request.QueryString["success"];
            var durationParts = ct.Request.QueryString["duration"].Split(':');
            var complete = ct.Request.QueryString["complete"];
            var progress = ct.Request.QueryString["progress"];

            var verb = Getcmi5Verb(verbName);

            var context = new Context
            {
                registration = registration,
                contextActivities = new ContextActivities()
            };

            // All "cmi5 defined" statements MUST have a category with an "id" 
            // of "http://purl.org/xapi/cmi5/context/categories/cmi5". 
            context.contextActivities.category = new List<Activity>
            {
                cmi5ContextActivity()
            };

            // Statements with a results object that include either "success” or "completion” properties 
            // MUST have a category with an "id" of "http://purl.org/xapi/cmi5/context/categories/moveon". 
            // Other statements MUST NOT include the this property.
            if (!string.IsNullOrWhiteSpace(success) || !string.IsNullOrWhiteSpace(complete))
            {
                context.contextActivities.category.Add(new Activity
                {
                    id = new Uri("http://purl.org/xapi/cmi5/context/categories/moveon")
                });
            }

            // All "cmi5 defined" statements must include the sessionId
            context.extensions = new Extensions(JObject.Parse(
                    "{\"http://purl.org/xapi/cmi5/context/extensions/sessionid\": \"" + sessionId + "\"}"
            ));

            var statement = new Statement
            {
                actor = actor,
                verb = verb,
                target = activity,
                context = context,
                timestamp = DateTime.UtcNow
            };

            // Is there a duration value?
            TimeSpan? duration = null;
            if (!string.IsNullOrWhiteSpace(durationParts[0]) ||
                !string.IsNullOrWhiteSpace(durationParts[1]) ||
                !string.IsNullOrWhiteSpace(durationParts[2]))
            {
               duration = new TimeSpan(
                              (!string.IsNullOrWhiteSpace(durationParts[0]) ? Convert.ToInt32(durationParts[0]) : 0),
                              (!string.IsNullOrWhiteSpace(durationParts[1]) ? Convert.ToInt32(durationParts[1]) : 0),
                              (!string.IsNullOrWhiteSpace(durationParts[2]) ? Convert.ToInt32(durationParts[2]) : 0)); 
            }

            // Is there a result object?
            if (!string.IsNullOrWhiteSpace(score) ||
                !string.IsNullOrWhiteSpace(success) ||
                !string.IsNullOrWhiteSpace(complete) ||
                duration != null)
            {
                var result = new Result();

                if (!string.IsNullOrWhiteSpace(score))
                    result.score = new Score {scaled = Convert.ToDouble(score)};

                if (!string.IsNullOrWhiteSpace(success))
                    result.success = (success == "true");

                if (!string.IsNullOrWhiteSpace(complete))
                    result.completion = (complete == "true");

                if (duration != null)
                {
                    result.duration = (TimeSpan)duration;
                }

                if (!string.IsNullOrWhiteSpace(progress))
                {
                    result.extensions = new Extensions(JObject.Parse(
                        "{\"http://purl.org/xapi/cmi5/result/extensions/progress\": \"" + progress + "\"}"
                    ));   
                }

                statement.result = result;
            }

            // Send the statement
            var lrs = GetLRS();
            var lrsResponse = lrs.SaveStatement(statement);

            var oSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            if (lrsResponse.success && string.IsNullOrWhiteSpace(lrsResponse.errMsg))
            {
                //ct.Response.Write("Saved " + lrsResponse.content.id);
                ct.Response.Write(oSerializer.Serialize(
                    new returnObj
                    {
                        HasError = 0,
                        ErrorMessage = Convert.ToString(statement.id)
                    }));
                return;
            }

            ct.Response.Write(oSerializer.Serialize(
                    new returnObj
                    {
                        HasError = 1,
                        ErrorMessage = lrsResponse.errMsg
                    }));
        }

        protected struct returnObj
        {
            public int HasError { get; set; }
            public string ErrorMessage { get; set; }
        }

        protected Verb Getcmi5Verb(string verbName)
        {
            var verb = new Verb { display = new LanguageMap() };
            switch (verbName.ToUpperInvariant())
            {
                case "INITIALIZED":
                    verb.id = new Uri("http://adlnet.gov/expapi/verbs/initialized");
                    verb.display.Add("en-US", "Initialized");
                    break;

                case "COMPLETED":
                    verb.id = new Uri("http://adlnet.gov/expapi/verbs/completed");
                    verb.display.Add("en-US", "Completed");
                    break;

                case "PASSED":
                    verb.id = new Uri("http://adlnet.gov/expapi/verbs/passed");
                    verb.display.Add("en-US", "Passed");
                    break;

                case "FAILED":
                    verb.id = new Uri("http://adlnet.gov/expapi/verbs/failed");
                    verb.display.Add("en-US", "Failed");
                    break;

                case "TERMINATED":
                    verb.id = new Uri("http://adlnet.gov/expapi/verbs/terminated");
                    verb.display.Add("en-US", "Terminated");
                    break;
            }

            return verb;
        }
       
    }
}