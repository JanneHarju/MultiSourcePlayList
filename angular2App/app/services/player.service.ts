import { Injectable } from '@angular/core';
import { Track } from '../models/track';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { TrackService } from '../services/track.service';
import { SpotifyService } from '../services/spotify.service';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class PlayerService {

    private subject = new Subject<Track>();
    track: Track = new Track();
    lastOrder: number = -1;
    tracklist: Track[] = [];
    queueTracklist: Track[] = [];
    random: number = 0;
    public shuffle: boolean;
    subscriptionTrackEnd: Subscription;
    constructor(
        private trackService: TrackService,
        private spotifyService: SpotifyService
    )
    {
        this.subscriptionTrackEnd = this.spotifyService.getTrackEnd().subscribe(trackEnd =>
        {
            if(trackEnd)
            {
                this.chooseNextTrack();
            }
        });
    }

    setTrack(newTrack: Track)
    {
        this.track = newTrack;
        this.subject.next(this.track);
    }
    getTrack() : Observable<Track>
    {
        return this.subject.asObservable();
    }
    
    getQueueTracks() : Track[]
    {
        return this.queueTracklist;
    }
    setTrackList(tracklist : Track[])
    {
        this.tracklist = tracklist;
    }
    setCurrentTrackOrder()
    {
        if(this.track && this.tracklist)
        {
            var newTrack = this.tracklist.find(t=> t.id == this.track.id);
            if(newTrack)
            {
                var currentTrackNewOrder = newTrack.order;
                this.track.order = currentTrackNewOrder;
            }
        }
    }
    chooseNextTrack()
    {
        if(this.queueTracklist.length > 0)
        {
            if(this.tracklist.find(x=>x.id == this.track.id))
            {
                this.lastOrder = this.track.order;
                console.log(this.lastOrder);
            }
            this.setTrack(this.queueTracklist.shift());
            //this.setQueue(this.queueTracklist);
        }
        else
        {
            if(!this.shuffle)
            {
            
                console.log(this.lastOrder);
                let order = this.lastOrder == -1 ? this.track.order : this.lastOrder;
                let nextTracks = this.tracklist.filter(x=>x.order > order);
                if(nextTracks != null && nextTracks.length > 0)
                {
                    this.setTrack(nextTracks[0]);
                }
                else
                {
                    this.setTrack(this.tracklist[0]);
                }
                this.lastOrder = -1;
            
            }
            else
            {
                this.chooseNextRandomTrack();
            }
        }
    }
    choosePreviousTrack()
    {
        let nextTracks = this.tracklist.filter(x=>x.order < this.track.order);
        if(nextTracks != null && nextTracks.length > 0)
        {
            this.setTrack(nextTracks[nextTracks.length-1]);
        }
        else
        {
            this.setTrack(this.tracklist[this.tracklist.length-1]);
        }
    }
    chooseNextRandomTrack()
    {
        this.random = Math.floor(Math.random() * this.tracklist.length);
        this.setTrack(this.tracklist[this.random]);
    }
    isCurrentlyPlayingTrackThisPlaylistTrack(playlistId: number): boolean
    {
        return (this.track && 
                this.track.playlist && 
                this.track.playlist.id == playlistId)
    }
    addTrackToQueue(track: Track)
    {
        this.queueTracklist.push(track);
        //this.setQueue(this.queueTracklist);
    }
}