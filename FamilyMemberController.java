package com.wardmanagement.controller;

import com.wardmanagement.model.FamilyMember;
import com.wardmanagement.repository.FamilyMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class FamilyMemberController {

    @Autowired
    private FamilyMemberRepository memberRepository;

    @GetMapping
    public List<FamilyMember> getAllMembers() {
        return memberRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FamilyMember> getMemberById(@PathVariable Long id) {
        return memberRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/disabled")
    public List<FamilyMember> getDisabledMembers() {
        return memberRepository.findByIsDisabledTrue();
    }

    @GetMapping("/seniors")
    public List<FamilyMember> getSeniorCitizens() {
        return memberRepository.findByIsSeniorCitizenTrue();
    }

    @GetMapping("/students")
    public List<FamilyMember> getStudents() {
        return memberRepository.findByIsStudentTrue();
    }

    @GetMapping("/occupation/{occupation}")
    public List<FamilyMember> getMembersByOccupation(@PathVariable String occupation) {
        return memberRepository.findByOccupationContainingIgnoreCase(occupation);
    }

    @GetMapping("/search")
    public List<FamilyMember> searchMembers(@RequestParam String query) {
        return memberRepository.searchByNameOrPhone(query);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FamilyMember> updateMember(@PathVariable Long id, @RequestBody FamilyMember memberDetails) {
        return memberRepository.findById(id)
                .map(member -> {
                    member.setName(memberDetails.getName());
                    member.setDateOfBirth(memberDetails.getDateOfBirth());
                    member.setRelation(memberDetails.getRelation());
                    member.setPhoneNumber(memberDetails.getPhoneNumber());
                    member.setOccupation(memberDetails.getOccupation());
                    member.setIsStudent(memberDetails.getIsStudent());
                    member.setIsSeniorCitizen(memberDetails.getIsSeniorCitizen());
                    member.setIsDisabled(memberDetails.getIsDisabled());
                    member.setMedicalNeeds(memberDetails.getMedicalNeeds());
                    return ResponseEntity.ok(memberRepository.save(member));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMember(@PathVariable Long id) {
        return memberRepository.findById(id)
                .map(member -> {
                    memberRepository.delete(member);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}