import { Injectable } from '@nestjs/common';

@Injectable()
export class HTMLService {

    public createLink(link, text) {
        return `<a href="${link}">${text}</a>`;
    }

}

export default new HTMLService();