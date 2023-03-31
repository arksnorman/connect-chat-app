class ChatOps {
  chatSession;
  static instance;

  constructor() {
    if (ChatOps.instance == null) {
      ChatOps.instance = this;
    }
    return ChatOps.instance;
  }

  setChatSession(chatSession) {
    this.chatSession = chatSession;
    this.initializeListeners();
  }

  async sendMessage(message) {
    let data = {
      contentType: "text/plain",
      message: message,
    };
    await this.chatSession.sendMessage(data);
  }

  initializeListeners() {
    this.chatSession.onMessage(this.messageHandler.bind(this));
  }

  async messageHandler(event) {
    const { chatDetails, data } = event;
    if (this.donorIsAskingForRoomID(event)) {
      await this.sendRoomId();
    }
    if (this.isDonorDetails(event)) {
      await this.sendAckForClientDetails();
    }
  }

  async sendRoomId() {
    const roomId = crypto.randomUUID();
    const message = `$ROOMID:${roomId}`;
    await this.sendMessage(message);
    // let x = 0;
    // let msgs = []
    // while (x < 50) {
    //   const roomId = crypto.randomUUID();
    //   const message = `$ROOMID:${roomId}`;
    //   msgs.push(this.sendMessage(message));
    //   x = x + 1;
    // }
    // await Promise.all(msgs)
  }

  async sendAckForClientDetails() {
    await this.sendMessage("Kindly note the we have received your details");
  }

  donorIsAskingForRoomID(event) {
    return event.data.Content === "SHAREROOMID";
  }

  isDonorDetails(event) {
    return event.data.Content === "CLIENTDETAILS";
  }
}

const chatOps = new ChatOps();
export default chatOps;
