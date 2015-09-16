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
                        <label for="txtProfile"><asp:Literal runat="server" Text="State API Document" /></label>
                        <asp:TextBox ID="txtProfile" ClientIDMode="Static" CssClass="form-control" placeholder="Agent Profile Document" style="max-width: 500px;" runat="server" TabIndex="0" ReadOnly="true" TextMode="MultiLine" Rows="2" />
                        <button id="btnProfile" class="btn btn-default btn-block" style="max-width: 300px;" onclick="return GetAgentProfile();">Fetch Agent Profile Document</button>                        
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
                                    <div class="panel-body" style="max-height: 160px; overflow-y: scroll;">
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
</script>
<script type="text/javascript" src="Scripts/xapiwrapper.min.js"></script>
<script type="text/javascript" src="Scripts/cmi5AUSimulator.min.js"></script>
</asp:Content>
