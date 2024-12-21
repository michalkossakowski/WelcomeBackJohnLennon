export class Message {
  id: string;
  channelId: string;
  publishDate: Date;
  author: string;
  authorId: string;
  content: string;

  constructor(id: string, channelId: string, publishDate: Date, author: string, authorId: string, content: string) {
    this.id = id;
    this.channelId = channelId;
    this.publishDate = publishDate;
    this.author = author;
    this.authorId = authorId;
    this.content = content;
  }
}
