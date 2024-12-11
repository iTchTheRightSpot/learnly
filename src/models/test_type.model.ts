export interface TestTypeEntity {
  test_id: number;
  name: string;
  duration: number;
  clean_up_time: number;
}

export interface StaffTestTypeEntity {
  staff_id: number;
  junction_id: number;
  test_id: number;
}
