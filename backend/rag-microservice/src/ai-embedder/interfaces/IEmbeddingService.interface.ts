export interface IEmbeddingService {
  getEmbedding(text: string, query: boolean): Promise<number[]>;
}
