export type AccessStatus = 'PENDING'|'ACTIVE'|'SUSPENDED'|'EXPIRED'|'REVOKED';
export interface Access { user_id:string; access_status:AccessStatus; access_type:'PERMANENT'|'TEMPORARY'; access_start:string|null; access_expires:string|null; created_at?:string; updated_at?:string; }
export function effectiveStatus(access:Access|null,now=Date.now()):AccessStatus {
 if(!access)return 'PENDING'; if(access.access_status!=='ACTIVE')return access.access_status;
 if(!access.access_start || !Number.isFinite(Date.parse(access.access_start)) || Date.parse(access.access_start)>now)return 'PENDING';
 if(access.access_type==='TEMPORARY' && (!access.access_expires || !Number.isFinite(Date.parse(access.access_expires)) || Date.parse(access.access_expires)<=now))return 'EXPIRED';
 return 'ACTIVE';
}
