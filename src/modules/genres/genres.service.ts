import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { CreateGenreDto } from './dto/create-genre.dto';

@Injectable()
export class GenresService {
  private genres: any[] = [];

  create(createGenreDto: CreateGenreDto) {
    const genre = {
      id: Date.now().toString(),
      ...createGenreDto,
    };
    this.genres.push(genre);
    return genre;
  }

  findAll() {
    return this.genres;
  }

  findOne(id: string) {
    const genre = this.genres.find(genre => genre.id === id);
    if (!genre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }
    return genre;
  }

  update(id: string, updateGenreDto: UpdateGenreDto) {
    const genreIndex = this.genres.findIndex(genre => genre.id === id);
    if (genreIndex === -1) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }
    this.genres[genreIndex] = {
      ...this.genres[genreIndex],
      ...updateGenreDto,
    };
    return this.genres[genreIndex];
  }

  remove(id: string) {
    const genreIndex = this.genres.findIndex(genre => genre.id === id);
    if (genreIndex === -1) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }
    const [removedGenre] = this.genres.splice(genreIndex, 1);
    return removedGenre;
  }
} 