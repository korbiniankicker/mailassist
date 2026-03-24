export interface ILLMService {
  generatePromt(promt: string): AsyncGenerator<string>;
}
