export class Message {
  id: string;
  channelId: string;
  publishDate: Date;
  author: string;
  authorId: string;
  content: string;
  filePath?: string;

  constructor(id: string, channelId: string, publishDate: Date, author: string, authorId: string, content: string, filePath?: string) {
    this.id = id;
    this.channelId = channelId;
    this.publishDate = publishDate;
    this.author = author;
    this.authorId = authorId;
    this.content = content;
    this.filePath = filePath;
  }
}
