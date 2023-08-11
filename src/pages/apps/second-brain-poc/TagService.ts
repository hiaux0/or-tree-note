import { ITag, Id } from '../../../domain/dataModel';
import generateId from '../../../modules/string/generateId';

export class TagService {
  constructor(private readonly tags: ITag[]) {
    if (!tags) this.tags = [];
  }

  static create(tags: ITag[]) {
    return new TagService(tags);
  }

  getTag(tagId: Id): ITag {
    const target = this.tags.find((tag) => tag.id === tagId);
    return target;
  }

  createTag(label: string): ITag {
    const newTag: ITag = {
      id: generateId(),
      label,
    };
    return newTag;
  }

  addTag(newTag: ITag): void {
    this.tags.push(newTag);
  }
}
