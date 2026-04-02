export interface IEmbeddingService {
  getEmbedding(text: string): Promise<number[]>;
}
