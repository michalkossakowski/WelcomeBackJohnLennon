export class Message {
  constructor(id, channelId, publishDate, author, content) {
      this.id = id;
      this.channelId = channelId;
      this.publishDate = publishDate;
      this.author = author;
      this.content = content;
  }
}