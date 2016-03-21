using System;
using System.Collections.Generic;
using System.Web;
using AUSimulator.Classes;
using Newtonsoft.Json.Linq;
using TinCan;
using TinCan.Json;
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
            var masteryScore = ct.Request.QueryString["masteryScore"];
            var auName = Convert.ToString(ct.Request.QueryString["auName"]);

            if (!string.IsNullOrWhiteSpace(auName))
            {
                activity.definition = new ActivityDefinition
                {
                    name = new LanguageMap(new StringOfJSON(auName))
                };
            }

            var verb = Getcmi5Verb(verbName);

            var context = new Context
            {
                registration = registration,
                contextActivities = new ContextActivities()
            };

            // All "cmi5 defined" statements MUST have a specific category 
            context.contextActivities.category = new List<Activity>
            {
                cmi5ContextActivity()
            };

            // Statements with a results object that include either "success” or "completion” properties 
            // MUST have a category with an "id" of cmi5Constants.MoveOn. 
            // Other statements MUST NOT include the this property.
            if (!string.IsNullOrWhiteSpace(success) || !string.IsNullOrWhiteSpace(complete))
            {
                context.contextActivities.category.Add(new Activity
                {
                    id = new Uri(cmi5Constants.moveOn)
                });
            }

            // All "cmi5 defined" statements must include the sessionId
            var extensions = '"' + cmi5Constants.SessionIdIRI + "\": \"" + sessionId + '"';
                             
            if (verbName.ToUpperInvariant() == "PASSED" || verbName.ToUpperInvariant() == "FAILED")
            {
                // Passed and Failed statements require the masteryScore as an extension
                extensions += ",\"" + cmi5Constants.masteryScore + "\": " + masteryScore;
            }

            context.extensions = new Extensions(JObject.Parse("{" + extensions + "}"));

            var statement = new Statement
            {
                id = Guid.NewGuid(),
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
                        "{" + cmi5Constants.Progress + "\": \"" + progress + "\"}"
                    ));   
                }

                statement.result = result;
            }

            // Send the statement
            var lrs = GetLRS();

            var sendSuccess = false;

            var msg = "";
            for (var try_ = 1; try_ < 3; try_++)
            {
                var lrsResponse = lrs.SaveStatement(statement);

                if (lrsResponse.success)
                {
                    msg = "";
                    sendSuccess = true;
                    break;
                }

                msg = lrsResponse.errMsg + Environment.NewLine + lrsResponse.httpException.Message;
                System.Threading.Thread.Sleep(500);
            }

            var oSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            if (sendSuccess && string.IsNullOrWhiteSpace(msg))
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
                        ErrorMessage = msg
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
                    verb.id = new Uri(cmi5Verb.Initialized);
                    verb.display.Add("de-DE", "initialisierte");
                    verb.display.Add("en-US", "initialized");
                    verb.display.Add("fr-FR", "a initialisé");
                    verb.display.Add("es-ES", "inicializó");
                    break;

                case "COMPLETED":
                    verb.id = new Uri(cmi5Verb.Completed);
                    verb.display.Add("de-DE", "beendete");
                    verb.display.Add("en-US", "completed");
                    verb.display.Add("fr-FR", "a terminé");
                    verb.display.Add("es-ES", "completó");
                    break;

                case "PASSED":
                    verb.id = new Uri(cmi5Verb.Passed);
                    verb.display.Add("de-DE", "bestand");
                    verb.display.Add("en-US", "passed");
                    verb.display.Add("fr-FR", "a réussi");
                    verb.display.Add("es-ES", "aprobó");
                    break;

                case "FAILED":
                    verb.id = new Uri(cmi5Verb.Failed);
                    verb.display.Add("de-DE", "verfehlte");
                    verb.display.Add("en-US", "failed");
                    verb.display.Add("fr-FR", "a échoué");
                    verb.display.Add("es-ES", "fracasó");
                    break;

                case "TERMINATED":
                    verb.id = new Uri(cmi5Verb.Terminated);
                    verb.display.Add("de-DE", "beendete");
                    verb.display.Add("en-US", "terminated");
                    verb.display.Add("fr-FR", "a terminé");
                    verb.display.Add("es-ES", "terminó");
                    break;
            }

            return verb;
        }
    }
}