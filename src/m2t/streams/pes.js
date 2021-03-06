/**
 * @file: pes.js, created at Monday, 23rd December 2019 3:47:23 pm
 * @copyright Copyright (c) 2020
 * @author gem <gems.xu@gmail.com>
 */

/**
 * Packetized Elementary Stream.
 */
import Stream from '../../util/stream';
import CacheBuffer from '../../util/cache-buffer';
import PES from '../structs/pes';

class PesStream extends Stream {
	constructor(ctx, psi) {
		super();

		/**
		 * @private
		 */
		this.context = ctx;

		/**
		 * @type {PSI}
		 * @private
		 */
		this.PSI = psi;

		/**
		 * @type {?number}
		 * @private
		 */
		this.PID = null;

		/**
		 * @type {CacheBuffer}
		 * @private
		 */
		this.cache_buffer = new CacheBuffer();
	}

	/**
	 * @param {Packet} packet
	 */
	push(packet) {
		const self = this;

		// PES PID
		if (packet.PID > 0x00ff && packet.PID < 0x1fff) {
			if (this.PSI.currentProgramPID == -1) {
				self._pushPacket(packet);
			} else if (this.PSI.currentProgramPID !== packet.PID) {
				if (packet.payload_unit_start_indicator === 1) {
					self._assembleOnePES();
				}

				self._pushPacket(packet);
			}
		}
	}

	flush() {
		const self = this;

		// 组装最后一个PES
		self._assembleOnePES();

		self.emit('done');
	}

	reset() {
		this._clearCached();

		this.emit('reset');
	}

	_clearCached() {
		this.PID = null;
		this.cache_buffer.clear();
	}

	_pushPacket(p) {
		let empty = this.cache_buffer.empty;

		// Make first packet in cache is start unit.
		if (empty && p.payload_unit_start_indicator === 0) {
			return;
		}

		if (empty) {
			this.PID = p.PID;
		}

		this.cache_buffer.append(p.payload);
	}

	_assembleOnePES() {
		const self = this;

		if (!this.cache_buffer.empty) {
			let bytes;

			try {
				bytes = this.cache_buffer.toNewBytes();
			} catch (e) {
				throw `pes alloc mem err ${this.cache_buffer.byteLength}`;
			}

			let pesData = new PES(bytes);
			let track = this.PSI.findTrack(this.PID);

			// console.log(`stream_id: ${pesData.stream_id}, PTS: ${pesData.PTS}, DTS: ${pesData.DTS}`);

			if (track) {
				// Assemble one pes packet, emit it to next stream.
				self.emit('data', {
					pid: track.id,
					stream_type: track.stream_type,
					pcr_pid: track.pcr_pid,
					pes: pesData
				});
			}

			self._clearCached();
		}
	}
}

export default PesStream;
