// order is important, alternatively use <script> tags
import "amazon-connect-streams";
import "amazon-connect-chatjs";
import chatOps from "./src/ChatOps.js";

window.localStorage.removeItem("connectPopupManager::connect::loginPopup");

// Connect information: Replace with your Connect Instance
const ccpUrl = "https://instancename.my.connect.aws/connect/ccp-v2";

const connectRegion = "";

//----------------Init CCP Start----------------------------
try {
  const containerDiv = document.getElementById("test");
  connect.core.initCCP(containerDiv, {
    ccpUrl: ccpUrl, // REQUIRED
    loginPopup: true, // optional, defaults to `true`
    loginPopupAutoClose: true, // optional, defaults to `false`
    loginOptions: {
      // optional, if provided opens login in new window
      autoClose: true, // optional, defaults to `false`
      height: 600, // optional, defaults to 578
      width: 400, // optional, defaults to 433
      top: 0, // optional, defaults to 0
      left: 0, // optional, defaults to 0
    },

    region: connectRegion, // REQUIRED for `CHAT`, optional otherwise
    softphone: {
      // optional, defaults below apply if not provided
      allowFramedSoftphone: true, // optional, defaults to false
      disableRingtone: false, // optional, defaults to false
    },
    pageOptions: {
      // optional
      enableAudioDeviceSettings: true, // optional, defaults to 'false'
      enablePhoneTypeSettings: true, // optional, defaults to 'true'
    },
    ccpAckTimeout: 5000, //optional, defaults to 3000 (ms)
    ccpSynTimeout: 3000, //optional, defaults to 1000 (ms)
    ccpLoadTimeout: 10000, //optional, defaults to 5000 (ms)
  });
  connect.getLog().warn("CDEBUG >> CCP initialized");
} catch (err) {
  console.error("initCCP", err);
}

connect.contact(async (contact) => {
  if (contact.getType() !== connect.ContactType.CHAT) {
    return;
  }

  const cnn = contact
    .getConnections()
    .find((cnn) => cnn.getType() === connect.ConnectionType.AGENT);
  const chatSession = connect.ChatSession.create({
    chatDetails: cnn.getMediaInfo(),
    options: {
      region: connectRegion,
    },
    type: connect.ChatSession.SessionTypes.AGENT,
    websocketManager: connect.core.getWebSocketManager(),
  });
  await chatSession.connect();
  chatOps.setChatSession(chatSession);
  await chatOps.sendMessage("Chat session now open");

  contact.onAccepted(async (contact) => {
    await chatOps.sendMessage("An agent has accepted your call");
    // await chatOps.sendRoomId();
  });

  contact.onConnected(async (contact) => {
    await chatOps.sendMessage("You are now connected to an agent");
    // await chatOps.sendRoomId();
  });
});
