import { ITag, Id } from '../../../domain/dataModel';
import generateId from '../../../modules/string/generateId';

export class TagService {
  constructor(private tags: ITag[]) {
    if (!tags) this.tags = [];
  }

  static create(tags: ITag[]) {
    return new TagService(tags);
  }

  getAllTag(): ITag[] {
    return this.tags;
  }

  getTag(tagId: Id): ITag {
    const target = this.tags.find((tag) => tag.id === tagId);
    return target;
  }

  getTagByLabel(label: string): ITag {
    const target = this.tags.find((tag) => tag.label === label);
    return target;
  }

  getTagById(tagId: ITag['id']): ITag {
    const target = this.tags.find((tag) => tag.id === tagId);
    return target;
  }

  createTag(label: string): ITag | null {
    const labelExists = this.getTagByLabel(label);
    if (labelExists) return labelExists;

    const newTag: ITag = {
      id: generateId(),
      label,
    };
    return newTag;
  }

  addTag(newTag: ITag): void | null {
    const exists = this.getTagByLabel(newTag.label);
    if (exists) return null;
    this.tags.push(newTag);
  }

  removeTag(tagId: string) {
    const updatedTags = this.tags.filter((tag) => tag.id !== tagId);
    /* prettier-ignore */ console.log('>>>> 4 >>>> ~ file: TagService.ts:51 ~ updatedTags:', updatedTags);
    this.tags = updatedTags;
    return updatedTags;
  }
}
