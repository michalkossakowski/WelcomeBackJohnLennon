export class Message {
  id: string;
  channelId: string;
  publishDate: Date;
  author: string;
  content: string;

  constructor(id: string, channelId: string, publishDate: Date, author: string, content: string) {
    this.id = id;
    this.channelId = channelId;
    this.publishDate = publishDate;
    this.author = author;
    this.content = content;
  }
}
