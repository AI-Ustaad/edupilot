useEffect(() => {
    let mounted = true; // 👉 Fix: Memory Leak Protection
    setIsMounted(true);
    
    // 👉 Fix: Bulletproof Local Timezone Date
    const today = new Date();
    const todayStr = today.toLocaleDateString("en-CA"); // Gives YYYY-MM-DD in local time

    const unsubStudents = onSnapshot(collection(db, "students"), (snap) => {
      if(mounted) setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubMarks = onSnapshot(collection(db, "marks"), (snap) => {
      if(mounted) setMarks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubStaff = onSnapshot(collection(db, "staff"), (snap) => {
      if(mounted) setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    const unsubProxies = onSnapshot(query(collection(db, "arrangements"), where("date", "==", todayStr)), (snap) => {
      if(mounted) setProxies(snap.docs.map(d => d.data()));
    });

    const unsubStaffAtt = onSnapshot(query(collection(db, "staffAttendance"), where("date", "==", todayStr)), (snap) => {
      if(mounted) {
        setStaffAttendance(snap.docs.map(d => d.data()));
        setLoading(false);
      }
    });

    const unsubStudentAtt = onSnapshot(query(collection(db, "attendance"), where("date", "==", todayStr)), (snap) => {
      if(mounted) setTodayStudentAttendance(snap.docs.map(d => d.data()));
    });

    return () => { 
      mounted = false; // 👉 Fix: Cleanup prevents state updates on unmounted component
      unsubStudents(); unsubMarks(); unsubStaff(); unsubProxies(); unsubStaffAtt(); unsubStudentAtt(); 
    };
  }, []);
