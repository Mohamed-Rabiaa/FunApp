import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class LocationHelper {
    constructor(private readonly configService: ConfigService) {}

    isWithinEgypt(latitude: number, longitude: number) {
        return latitude >= 22.0 && latitude <= 31.5 && longitude >= 25.0 && longitude <= 35.0;
    }

    async getCityByCordinates(latitude: number, longitude: number): Promise<string> {
        const apiKey = this.configService.get<string>('API_KEY');
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;
        try {
            const response = await axios.get(url);
            const results = response.data.results;
            if (results.length > 0) {
                return results[0].components.city || 'unkwon city';
            }
            return 'unkwon city';
        } catch (error) {
            throw new BadRequestException('Failed to determine city from coordinates');
        }
    }
}   
