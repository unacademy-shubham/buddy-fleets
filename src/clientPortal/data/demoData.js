const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const DEMO_COMPANIES = {
  travels: {
    company: {
      id: 'demo-travels-company',
      company_name: 'Shree Balaji Travels',
      company_code: 'DEMO-TRAVEL',
      subdomain_slug: 'demo-travels',
      fleetPack: 'travels',
      status: 'active',
    },
    currentUser: {
      id: 'demo-owner-travels',
      name: 'Demo Owner',
      email: 'owner@demo.buddyfleets.in',
      role: 'Company Owner',
      isAccountOwner: true,
      mfaEnabled: true,
    },
    sites: [
      { id: 't-site-1', code: 'AMD-HO', name: 'Ahmedabad Head Office', site_type: 'Head Office', city: 'Ahmedabad', state: 'Gujarat', status: 'active', is_primary: true },
      { id: 't-site-2', code: 'AMD-YARD', name: 'Ahmedabad Parking Yard', site_type: 'Parking Yard', city: 'Ahmedabad', state: 'Gujarat', status: 'active' },
      { id: 't-site-3', code: 'UDA-BR', name: 'Udaipur Branch', site_type: 'Branch Office', city: 'Udaipur', state: 'Rajasthan', status: 'active' },
    ],
    vehicles: [
      { id:'tv1', vehicle_number:'GJ01AB2486', vehicle_type:'Innova Crysta', body_type:'SUV', ownership:'Own', home_site_id:'t-site-1', status:'available', seating_capacity:7, insurance_expiry:daysFromNow(48), fitness_expiry:daysFromNow(116) },
      { id:'tv2', vehicle_number:'GJ01CD7711', vehicle_type:'Tempo Traveller', body_type:'17 Seater', ownership:'Own', home_site_id:'t-site-1', status:'on_trip', seating_capacity:17, insurance_expiry:daysFromNow(19), fitness_expiry:daysFromNow(73) },
      { id:'tv3', vehicle_number:'GJ01EF9024', vehicle_type:'Luxury Coach', body_type:'45 Seater', ownership:'Own', home_site_id:'t-site-2', status:'on_trip', seating_capacity:45, insurance_expiry:daysFromNow(91), fitness_expiry:daysFromNow(28) },
      { id:'tv4', vehicle_number:'RJ27GH1098', vehicle_type:'Ertiga', body_type:'MPV', ownership:'Attached', home_site_id:'t-site-3', status:'reserved', seating_capacity:7, insurance_expiry:daysFromNow(12), fitness_expiry:daysFromNow(180) },
      { id:'tv5', vehicle_number:'GJ01JK4478', vehicle_type:'Mini Bus', body_type:'27 Seater', ownership:'Own', home_site_id:'t-site-2', status:'maintenance', seating_capacity:27, insurance_expiry:daysFromNow(64), fitness_expiry:daysFromNow(33) },
    ],
    drivers: [
      { id:'td1', driver_code:'DRV-001', full_name:'Ramesh Patel', mobile:'9876543210', primary_site_id:'t-site-1', status:'active', dl_number:'GJ0120220012345', dl_expiry:daysFromNow(190), current_vehicle:'GJ01AB2486' },
      { id:'td2', driver_code:'DRV-002', full_name:'Imran Sheikh', mobile:'9898123456', primary_site_id:'t-site-1', status:'active', dl_number:'GJ0120200045612', dl_expiry:daysFromNow(44), current_vehicle:'GJ01CD7711' },
      { id:'td3', driver_code:'DRV-003', full_name:'Mahesh Solanki', mobile:'9825012345', primary_site_id:'t-site-3', status:'active', dl_number:'RJ2720210008891', dl_expiry:daysFromNow(83), current_vehicle:'RJ27GH1098' },
    ],
    users: [
      { id:'tu1', full_name:'Demo Owner', email:'owner@demo.buddyfleets.in', designation:'Owner', role_name:'Company Owner', site_names:['All Sites'], status:'active', mfa_enabled:true },
      { id:'tu2', full_name:'Neha Shah', email:'accounts@demo.buddyfleets.in', designation:'Accountant', role_name:'Accountant', site_names:['Ahmedabad Head Office','Udaipur Branch'], status:'active', mfa_enabled:true },
      { id:'tu3', full_name:'Amit Rathod', email:'booking@demo.buddyfleets.in', designation:'Booking Executive', role_name:'Booking Executive', site_names:['Ahmedabad Head Office'], status:'active', mfa_enabled:false },
    ],
    parties: [
      { id:'tp1', party_name:'Aarav Technologies Pvt Ltd', party_type:'Corporate Customer', gstin:'24AACCA1234F1Z5', city:'Ahmedabad', state:'Gujarat', mobile:'9876500011', status:'active' },
      { id:'tp2', party_name:'Royal Event Planners', party_type:'Customer', gstin:'', city:'Udaipur', state:'Rajasthan', mobile:'9876500022', status:'active' },
    ],
    bookings: [
      { id:'tb1', site_id:'t-site-1', booking_no:'BKG/26-27/00128', customer:'Aarav Technologies Pvt Ltd', pickup:'Ahmedabad', drop:'Udaipur', pickup_at:new Date(Date.now()+86400000).toISOString(), return_at:new Date(Date.now()+3*86400000).toISOString(), trip_type:'Outstation', vehicle_category:'Tempo Traveller', vehicle_number:'GJ01CD7711', driver_name:'Imran Sheikh', amount:32000, advance:10000, status:'confirmed', payment_status:'partial' },
      { id:'tb2', site_id:'t-site-2', booking_no:'BKG/26-27/00129', customer:'Royal Event Planners', pickup:'Udaipur', drop:'Kumbhalgarh', pickup_at:new Date(Date.now()+2*86400000).toISOString(), return_at:new Date(Date.now()+2.5*86400000).toISOString(), trip_type:'Event', vehicle_category:'Ertiga', vehicle_number:'RJ27GH1098', driver_name:'Mahesh Solanki', amount:9500, advance:3000, status:'vehicle_assigned', payment_status:'partial' },
      { id:'tb3', site_id:'t-site-1', booking_no:'BKG/26-27/00130', customer:'Walk-in Customer', pickup:'Ahmedabad Airport', drop:'Gandhinagar', pickup_at:new Date(Date.now()+5*3600000).toISOString(), return_at:null, trip_type:'Airport Transfer', vehicle_category:'Innova Crysta', vehicle_number:'GJ01AB2486', driver_name:'Ramesh Patel', amount:2400, advance:2400, status:'confirmed', payment_status:'paid' },
    ],
    expenses: [
      { id:'te1', date:daysFromNow(0), category:'Fuel', amount:7800, vehicle_number:'GJ01CD7711', vendor:'HP Fuel Station', payment_mode:'UPI', site_id:'t-site-1' },
      { id:'te2', date:daysFromNow(0), category:'Driver Allowance', amount:1200, vehicle_number:'GJ01CD7711', vendor:'Imran Sheikh', payment_mode:'Cash', site_id:'t-site-1' },
    ],
  },

  cement: {
    company: {
      id: 'demo-cement-company',
      company_name: 'Shree Cement Logistics',
      company_code: 'DEMO-CEMENT',
      subdomain_slug: 'demo-cement',
      fleetPack: 'bagged_cement',
      status: 'active',
    },
    currentUser: {
      id: 'demo-owner-cement',
      name: 'Demo Owner',
      email: 'owner@demo.buddyfleets.in',
      role: 'Company Owner',
      isAccountOwner: true,
      mfaEnabled: true,
    },
    sites: [
      { id:'c-site-1', code:'KUT-PLANT', name:'Kutch Cement Plant', site_type:'Plant', city:'Kutch', state:'Gujarat', status:'active', is_primary:true },
      { id:'c-site-2', code:'AMD-PLANT', name:'Ahmedabad Cement Plant', site_type:'Plant', city:'Ahmedabad', state:'Gujarat', status:'active' },
      { id:'c-site-3', code:'SRT-PLANT', name:'Surat Cement Plant', site_type:'Plant', city:'Surat', state:'Gujarat', status:'active' },
      { id:'c-site-4', code:'JPR-PLANT', name:'Jaipur Cement Plant', site_type:'Plant', city:'Jaipur', state:'Rajasthan', status:'active' },
    ],
    vehicles: Array.from({length:18}).map((_,i)=>({
      id:`cv${i+1}`,
      vehicle_number:`GJ12AB${String(4100+i).padStart(4,'0')}`,
      vehicle_type:i%3===0?'32 FT MXL':'Open Body Truck',
      body_type:'Bagged Cement',
      ownership:i%4===0?'Attached':'Own',
      home_site_id:`c-site-${(i%4)+1}`,
      status:['available','at_plant','in_transit','delivered'][i%4],
      payload_mt:[28,30,31][i%3],
      insurance_expiry:daysFromNow(20+i*5),
      fitness_expiry:daysFromNow(35+i*4),
    })),
    drivers: Array.from({length:12}).map((_,i)=>({
      id:`cd${i+1}`, driver_code:`CDRV-${String(i+1).padStart(3,'0')}`, full_name:['Ramesh Patel','Arjun Singh','Irfan Khan','Jignesh Parmar','Suresh Yadav','Harish Meena'][i%6]+' '+(i>5?2:1), mobile:`98${String(70000000+i*341).padStart(8,'0')}`, primary_site_id:`c-site-${(i%4)+1}`, status:'active', dl_number:`DL-${i+101}`, dl_expiry:daysFromNow(55+i*11), current_vehicle:`GJ12AB${String(4100+i).padStart(4,'0')}`
    })),
    users: [
      { id:'cu1', full_name:'Demo Owner', email:'owner@demo.buddyfleets.in', designation:'Owner', role_name:'Company Owner', site_names:['All Sites'], status:'active', mfa_enabled:true },
      { id:'cu2', full_name:'Rahul Sharma', email:'rahul@demo.buddyfleets.in', designation:'Plant Manager', role_name:'Plant Manager', site_names:['Kutch Cement Plant'], status:'active', mfa_enabled:true },
      { id:'cu3', full_name:'Amit Joshi', email:'amit@demo.buddyfleets.in', designation:'Regional Manager', role_name:'Regional Manager', site_names:['Kutch Cement Plant','Ahmedabad Cement Plant','Surat Cement Plant'], status:'active', mfa_enabled:false },
      { id:'cu4', full_name:'Neha Shah', email:'accounts@demo.buddyfleets.in', designation:'Accountant', role_name:'Accountant', site_names:['All Sites'], status:'active', mfa_enabled:true },
    ],
    parties: [
      { id:'cp1', party_name:'Shakti Cement Dealers', party_type:'Dealer', gstin:'24AABCS1234K1Z2', city:'Ahmedabad', state:'Gujarat', mobile:'9876500011', status:'active' },
      { id:'cp2', party_name:'Marwar Buildmart', party_type:'Dealer', gstin:'08AACCM1122P1Z8', city:'Udaipur', state:'Rajasthan', mobile:'9876500022', status:'active' },
      { id:'cp3', party_name:'Kutch Cement Manufacturing Ltd', party_type:'Plant / Customer', gstin:'24AAACK4455D1Z9', city:'Kutch', state:'Gujarat', mobile:'9876500033', status:'active' },
    ],
    placements: [
      { id:'pl1', placement_no:'PLC/26-27/00521', site_id:'c-site-1', requirement_date:daysFromNow(0), required_vehicles:25, assigned_vehicles:23, reported_vehicles:18, loaded_vehicles:14, status:'open' },
      { id:'pl2', placement_no:'PLC/26-27/00522', site_id:'c-site-2', requirement_date:daysFromNow(0), required_vehicles:20, assigned_vehicles:20, reported_vehicles:16, loaded_vehicles:11, status:'open' },
      { id:'pl3', placement_no:'PLC/26-27/00523', site_id:'c-site-3', requirement_date:daysFromNow(0), required_vehicles:18, assigned_vehicles:17, reported_vehicles:15, loaded_vehicles:13, status:'open' },
      { id:'pl4', placement_no:'PLC/26-27/00524', site_id:'c-site-4', requirement_date:daysFromNow(0), required_vehicles:15, assigned_vehicles:14, reported_vehicles:12, loaded_vehicles:9, status:'open' },
    ],
    dispatches: [
      { id:'dp1', dispatch_no:'DSP/26-27/01882', site_id:'c-site-1', vehicle_number:'GJ12AB4101', driver_name:'Arjun Singh 1', dealer:'Shakti Cement Dealers', destination:'Ahmedabad', bags:560, net_weight_mt:28, loading_slip_no:'LS-9912', status:'in_transit', dispatched_at:new Date(Date.now()-4*3600000).toISOString(), delivered_at:null, pod_status:'pending', turnaround_hours:6.4 },
      { id:'dp2', dispatch_no:'DSP/26-27/01883', site_id:'c-site-2', vehicle_number:'GJ12AB4102', driver_name:'Irfan Khan 1', dealer:'Marwar Buildmart', destination:'Udaipur', bags:600, net_weight_mt:30, loading_slip_no:'LS-9913', status:'delivered', dispatched_at:new Date(Date.now()-12*3600000).toISOString(), delivered_at:new Date(Date.now()-2*3600000).toISOString(), pod_status:'received', turnaround_hours:7.2 },
      { id:'dp3', dispatch_no:'DSP/26-27/01884', site_id:'c-site-3', vehicle_number:'GJ12AB4103', driver_name:'Jignesh Parmar 1', dealer:'Shakti Cement Dealers', destination:'Vadodara', bags:620, net_weight_mt:31, loading_slip_no:'LS-9914', status:'at_plant', dispatched_at:null, delivered_at:null, pod_status:'not_applicable', turnaround_hours:8.1 },
      { id:'dp4', dispatch_no:'DSP/26-27/01885', site_id:'c-site-4', vehicle_number:'GJ12AB4104', driver_name:'Suresh Yadav 1', dealer:'Marwar Buildmart', destination:'Ajmer', bags:560, net_weight_mt:28, loading_slip_no:'LS-9915', status:'in_transit', dispatched_at:new Date(Date.now()-6*3600000).toISOString(), delivered_at:null, pod_status:'pending', turnaround_hours:6.9 },
    ],
    expenses: [
      { id:'ce1', date:daysFromNow(0), category:'Fuel', amount:18200, vehicle_number:'GJ12AB4101', vendor:'IOCL Fleet Pump', payment_mode:'Fleet Card', site_id:'c-site-1' },
      { id:'ce2', date:daysFromNow(0), category:'Driver Advance', amount:5000, vehicle_number:'GJ12AB4104', vendor:'Driver Advance', payment_mode:'Cash', site_id:'c-site-4' },
    ],
  },
};

export function getDemoCompany(mode = 'cement') {
  return structuredClone(DEMO_COMPANIES[mode] || DEMO_COMPANIES.cement);
}
