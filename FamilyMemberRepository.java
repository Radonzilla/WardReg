package com.wardmanagement.repository;

import com.wardmanagement.model.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {
    List<FamilyMember> findByIsDisabledTrue();
    List<FamilyMember> findByIsSeniorCitizenTrue();
    List<FamilyMember> findByIsStudentTrue();
    List<FamilyMember> findByOccupationContainingIgnoreCase(String occupation);
    
    @Query("SELECT m FROM FamilyMember m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(m.phoneNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<FamilyMember> searchByNameOrPhone(String searchTerm);
}