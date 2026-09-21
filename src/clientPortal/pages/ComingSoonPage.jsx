import React from 'react';
import { Construction } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function ComingSoonPage({ title, description }) {
  return <><PageHeader title={title} subtitle={description || 'Module is registered in Buddy Fleets and can be activated in a later functional phase.'}/><div className="bf-card"><div className="bf-card-body" style={{textAlign:'center',padding:'55px 20px'}}><Construction size={42} style={{margin:'0 auto 14px',color:'#7a00ff'}}/><h3 style={{margin:0}}>Module Ready for Functional Phase</h3><p className="bf-muted" style={{fontSize:11,maxWidth:560,margin:'8px auto 0'}}>Navigation, permissions and module registration are ready. Domain-specific workflow and database actions can be activated when this fleet/module enters the implementation phase.</p></div></div></>;
}
