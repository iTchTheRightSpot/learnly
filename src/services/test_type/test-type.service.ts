import { ILogger } from '@utils/log';
import { Adapters } from '@stores/adapters';

export interface ITypesService {
  types(): Promise<{ type: string }[]>;
}

export class TestTypeService implements ITypesService {
  constructor(
    private readonly logger: ILogger,
    private readonly adapters: Adapters
  ) {}

  // returns all test types or services offered by the Clinic
  async types(): Promise<{ type: string }[]> {
    const types = await this.adapters.testTypeStore.allTestTypes();
    return types.map((type) => ({ type: type.name }));
  }
}
