<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPages/MobileLearner.Master" AutoEventWireup="true" CodeBehind="cmi5AUSimulator.aspx.cs" Inherits="AUSimulator.cmi5AUSimulator" %>

<asp:Content ID="Content2" ContentPlaceHolderID="cntBody" runat="server">
       <div class="container">
        <div class="panel panel-primary">
            <div class="panel-heading">
                <h3 class="panel-title">cmi5 AU Simulator</h3>
            </div>
            <div class="panel-body">
               <form class="form-sim" runat="server">
                    <div style="align-self: center; position: relative;">
                        <label for="txtAuthToken"><asp:Literal runat="server" Text="auth-token" /></label>
                        <asp:TextBox ID="txtAuthToken" ClientIDMode="Static" CssClass="form-control" placeholder="auth-token" style="max-width: 300px;" runat="server" TabIndex="1" ReadOnly="true"/>
                        <button id="btnAuthToken" class="btn btn-primary btn-block" type="button" style="max-width: 300px;" onclick="return GetAuthToken();">Fetch auth-token</button>
                        <hr/>
                        <label for="txtState"><asp:Literal runat="server" Text="State API Document" /></label>
                        <asp:TextBox ID="txtState" ClientIDMode="Static" CssClass="form-control" placeholder="State API Document" style="max-width: 500px;" runat="server" TabIndex="0" ReadOnly="true" TextMode="MultiLine" Rows="5" />
                        <button id="btnState" class="btn btn-default btn-block" style="max-width: 300px;" onclick="return GetStateApi();">Fetch State API Document</button>
                        <hr/>
                         <div class="row">
                            <div class="col-sm-2">
                                <div class="panel panel-info" style="max-width: 140px;">
                                    <div class="panel-heading">
                                        <h3 class="panel-title">Verb</h3>
                                    </div>
                                    <div class="panel-body">
                                        <input type="radio" name="rdoVerb" value="Initialized" checked="checked"/>&nbsp;Initialized<br/>
                                        <input type="radio" name="rdoVerb" value="Completed"/>&nbsp;Completed<br/>
                                        <input type="radio" name="rdoVerb" value="Passed"/>&nbsp;Passed<br/>
                                        <input type="radio" name="rdoVerb" value="Failed"/>&nbsp;Failed<br/>
                                        <input type="radio" name="rdoVerb" value="Terminated"/>&nbsp;Terminated<br/>
                                    </div>
                                </div>
                                <div class="panel panel-info" style="max-width: 140px;">
                                    <div class="panel-heading">
                                        <h3 class="panel-title">Verbs Sent</h3>
                                    </div>
                                    <div class="panel-body" style="max-height: 160px; overflow: scroll;">
                                        <span id="spnVerbsSent"></span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-5">
                                <div class="panel panel-info" style="max-width: 400px;">
                                    <div class="panel-heading">
                                        <h3 class="panel-title">Result</h3>
                                    </div>
                                    <div class="panel-body">
                                        <table class="table">
                                            <tbody>
                                                <tr><td>Score (Scaled)</td>
                                                    <td><input type="number" id="txtScore" min="0.0" max="1.0" step=".05" style="width:80px" />&nbsp;
                                                        <span id="spnMasteryScore"></span><br/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Success</td>
                                                    <td><input type="radio" name="rdoSuccess" value="true"/>&nbsp;True<br/>
                                                        <input type="radio" name="rdoSuccess" value="false"/>&nbsp;False<br/>
                                                        <input type="radio" name="rdoSuccess" value="" checked="checked"/>&nbsp;Don't Send
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Complete</td>
                                                    <td><input type="radio" name="rdoComplete" value="true"/>&nbsp;True<br/>
                                                        <input type="radio" name="rdoComplete" value="false"/>&nbsp;False<br/>
                                                        <input type="radio" name="rdoComplete" value="" checked="checked"/>&nbsp;Don't Send</td>
                                                </tr>
                                                <tr>
                                                    <td>Duration</td>
                                                    <td>
                                                        <input type="number" id="durationHours" min="0" step="1" placeholder="Hours" style="width: 50px;"/> :
                                                        <input type="number" id="durationMinutes" min="0" step="1" placeholder="Min" style="width: 50px;"/> :
                                                        <input type="number" id="durationSeconds" min="0" step="1" placeholder="Sec" style="width: 50px;"/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Progress</td>
                                                    <td><input type="number" id="input_progress" min="0" step="1" style="width: 50px;"/></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button id="btnStatement" class="btn btn-default btn-block"
                                    style="max-width: 300px;" onclick="return SendStatement();" >Send Statement</button><br/><hr/>
                        <button id="btnLMS" class="btn btn-default btn-block" 
                                     onclick="return GoLMS();" style="max-width: 300px;">Return to LMS</button>
                    </div>
                </form>
            </div>
        </div>
        <div>
          <a href="http://risc-inc.com" target="_blank">
            <asp:Image ID="img2" runat="server" SkinID="Logo" ClientIDMode="Static" />
          </a>            
    </div>
    </div> <!-- /container -->
    
    <script type="text/javascript">
        var endPoint,
            fetchUrl,
            registration,
            activityId,
            actor,
            sessionId,
            masteryScore,
            returnUrl;

        var jq;

        $(function () {
            endPoint = parse("endpoint");
            fetchUrl = parse("fetch");
            registration = parse("registration");
            activityId = parse("activityid");
            actor = parse("actor");

            jq = $;

            jq("input:radio[name='rdoVerb']").change(function () {
                // Default success and completion based on judgement verbs
                var verb = jq(this).val();
                if (verb == "Initialized") {
                    jq("input:radio[name='rdoComplete'][value='']").prop("checked", true);
                    jq("input:radio[name='rdoSuccess'][value='']").prop("checked", true);
                }
                if (verb == "Completed") {
                    jq("input:radio[name='rdoComplete'][value='true']").prop("checked", true);
                    jq("input:radio[name='rdoSuccess'][value='']").prop("checked", true);
                }
                if (verb == "Passed") {
                    jq("input:radio[name='rdoComplete'][value='']").prop("checked", true);
                    jq("input:radio[name='rdoSuccess'][value='true']").prop("checked", true);
                }
                if (verb == "Failed") {
                    jq("input:radio[name='rdoSuccess'][value='false']").prop("checked", true);
                    jq("input:radio[name='rdoComplete'][value='false']").prop("checked", true);
                }
                if (verb == "Terminated") {
                    jq("#durationMinutes").val("1");
                }
            });
        });

        function GetAuthToken() {
            jq.support.cors = true;
            jq.ajax({
                async: false,
                url: fetchUrl,
                type: "POST",
                dataType: "json",
                contentType: "application/json; charset=utf-8"
            }).done(function (data) {
                // Check for error
                var e = typeof (data["error-code"]);
                if (e == "string") {
                    alert("error-code " + data["error-code"] + ": " + data["error-text"]);
                    return;
                }
                e = typeof (data["auth-token"]);
                if (e == "string") {
                    jq("#txtAuthToken").val(data["auth-token"]);
                    MarkSuccess("btnAuthToken");
                    MarkNext("btnState");
                } else {
                    alert("Invalid structure returned: " + data.toString());
                }
            }).fail(function(jqXHR, textStatus, errorThrown) {
                alert(errorThrown);
            });
            return false;
        }

        function GetStateApi() {
            jq.support.cors = true;
            jq.ajax({
                async: true,
                url: "Handlers/Getcmi5StateDocument.ashx?endpoint=" + endPoint +
                     "&activityId=" + activityId +
                     "&actor=" + actor +
                     "&registration=" + registration +
                     "&token=" + jq("#txtAuthToken").val(),
                type: "POST",
                dataType: "json",
                contentType: "application/json; charset=utf-8"
            }).done(function (data) {
                // Check for error
                if (data["ErrorCode"] != "0") {
                    alert("error-code " + data["ErrorCode"] + ": " + data["ErrorText"]);
                    return false;
                }

                // Set the sessionId var
                var obj = JSON.parse(data["StateDocument"]);
                sessionId = obj.contextTemplate.extensions["http://purl.org/xapi/cmi5/context/extensions/sessionid"];

                // Get returnUrl
                var r = typeof (obj["returnURL"]);
                if (r == "string") {
                    returnUrl = obj["returnURL"];
                }

                // Display mastery score
                masteryScore = obj["masteryScore"];
                jq("#spnMasteryScore").html("Mastery = " + masteryScore.toString());

                // Display the state document
                jq("#txtState").val(JSON.stringify(obj, null, 4));

                MarkSuccess("btnState");
                MarkNext("btnStatement");

            }).fail(function (jqXHR, textStatus, errorThrown) {
                alert(errorThrown);
            });
            return false;
        }

        function GoLMS() {
            if ((typeof returnUrl) == "string" && returnUrl.length > 0) {
                document.location.href = returnUrl;
                return false;
            }
            self.close();           // Not allowed in FireFox
            return false;
        }

        function MarkNext(buttonId) {
            jq("#" + buttonId).removeClass("btn-success btn-default").addClass("btn-primary");
        }

        function MarkSuccess(buttonId) {
            jq("#" + buttonId).removeClass("btn-primary btn-default").addClass("btn-success");
        }

        function SendStatement() {
            var verb = jq("input:radio[name='rdoVerb']:checked").val();
            var score = jq("#txtScore").val();
            var success = jq("input:radio[name='rdoSuccess']:checked").val();
            var complete = jq("input:radio[name='rdoComplete']:checked").val();
            var duration = jq("#durationHours").val() + ":" +
                           jq("#durationMinutes").val() + ":" +
                           jq("#durationSeconds").val();
            var progress = jq("#input_progress").val();

            jq.ajax({
                async: true,
                url: "Handlers/Sendcmi5Statement.ashx?endpoint=" + endPoint +
                     "&activityId=" + activityId +
                     "&actor=" + actor +
                     "&registration=" + registration +
                     "&token=" + jq("#txtAuthToken").val() +
                     "&sessionId=" + sessionId +
                     "&score=" + score +
                     "&verb=" + verb +
                     "&success=" + success +
                     "&complete=" + complete +
                     "&duration=" + duration +
                     "&progress=" + progress,
                type: "POST",
                contentType: "application/json; charset=utf-8"
            }).done(function (msg) {
                if (msg.substr(0, 6) == "FAILED") {
                    alert(msg);
                    return;
                }

                if (verb == "Terminated") {
                    MarkSuccess("btnStatement");
                    MarkNext("btnLMS");
                }

                jq("#spnVerbsSent").append(verb + "<br/>");
            }).fail(function (jqXHR, textStatus, errorThrown) {
                alert(errorThrown);
            });
            return false;
        }

        function parse(val) {
            // Parse parameters
            var result = "Not found",
                tmp = [];
            val = val.toUpperCase();
            location.search
                .substr(1)
                .split("&")
                .forEach(function (item) {
                    tmp = item.split("=");
                    if (tmp[0].toUpperCase() === val) result = decodeURIComponent(tmp[1]);
                });
            return result;
        }
</script>
</asp:Content>
