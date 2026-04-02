export interface ILLMService {
  generateResponse(promt: string): AsyncGenerator<string>;
}
