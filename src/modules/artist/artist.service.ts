import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

@Injectable()
export class ArtistService {
  private artists: any[] = [];

  create(createArtistDto: CreateArtistDto) {
    const artist = {
      id: Date.now().toString(),
      ...createArtistDto,
    };
    this.artists.push(artist);
    return artist;
  }

  findAll() {
    return this.artists;
  }

  findOne(id: string) {
    const artist = this.artists.find(artist => artist.id === id);
    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }
    return artist;
  }

  update(id: string, updateArtistDto: UpdateArtistDto) {
    const artistIndex = this.artists.findIndex(artist => artist.id === id);
    if (artistIndex === -1) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }
    this.artists[artistIndex] = {
      ...this.artists[artistIndex],
      ...updateArtistDto,
    };
    return this.artists[artistIndex];
  }

  remove(id: string) {
    const artistIndex = this.artists.findIndex(artist => artist.id === id);
    if (artistIndex === -1) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }
    const [removedArtist] = this.artists.splice(artistIndex, 1);
    return removedArtist;
  }
} 